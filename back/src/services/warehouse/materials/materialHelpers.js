import {
    applyUnitPresentationMeasurements,
    getPerPieceMeasureError,
    getUnitPresentationMeasurementsError,
    isFixedUnitPresentation
} from '../../../shared/inventory/wasteMeasurements.js';
import {
    ExcededMaxRetriesSkuError,
    MaterialAlreadyExists,
    MaterialMeasurementsInvalid,
    MaterialNotFound,
    MaterialRollReferenceReadOnly
} from "../../../errors/warehouse/materialError.js";
import { findUniquePresentation } from "../presentationService.js";
import { findUniqueUnitMeasure } from "../unitMeasureService.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findUniqueSupplier } from "../supplierService.js";
import { SupplierInactiveConflict } from "../../../errors/warehouse/supplierError.js";
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';
import { resolveServiceError } from '../../serviceErrorHandler.js';
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';


const serviceLogger = createServiceLogger('warehouse.materials.materialHelpers');


const MAX_RETRIES = 5;

export const assertMaterialRollReference = ({ referenceConeWeightKg, referenceRollTotalWeightKg }) => {
    if (referenceConeWeightKg !== undefined || referenceRollTotalWeightKg !== undefined) {
        throw new MaterialRollReferenceReadOnly();
    }
};

export const getMaterialMeasurementError = ({ material, presentation, unit, type }) =>
    type === MATERIAL_TYPES.CONSUMABLE || isFixedUnitPresentation(presentation)
        ? getUnitPresentationMeasurementsError(material, presentation)
        : getPerPieceMeasureError(unit, material);

export const prepareMaterialData = async ({ tx, materialDto, materialId = null, context = null, requireSupplier = true }) => {

    const { presentationId, unitMeasureId, supplierId, minStock, maxUnitCost, isActive, referenceConeWeightKg, referenceRollTotalWeightKg, ...input } = materialDto;

    // La transacción comparte una conexión: cada consulta debe terminar antes de enviar la siguiente.
    const unit = context?.units?.get(unitMeasureId) ?? await findUniqueUnitMeasure({ tx, id: unitMeasureId });
    const presentation = context?.presentations?.get(presentationId) ?? await findUniquePresentation({ tx, id: presentationId });
    const rest = applyUnitPresentationMeasurements(input, presentation);
    const measureError = getMaterialMeasurementError({ material: rest, presentation, unit, type: rest.type });
    if (measureError) throw new MaterialMeasurementsInvalid(measureError);
    const supplier = requireSupplier
        ? context?.suppliers?.get(supplierId) ?? await findUniqueSupplier({ tx, id: supplierId })
        : null;

    assertMaterialRollReference({ referenceConeWeightKg, referenceRollTotalWeightKg });

    if (supplier?.isActive === false) throw new SupplierInactiveConflict();

    assertPieceQuantity({ quantity: minStock, item: { presentation } });

    return {
        rest,
        relations: {
            presentationId,
            unitMeasureId,
            supplierId,
            minStock,
            maxUnitCost,
            isActive
        }
    };
};

export const withRetry = async (fn) => {

    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            return await fn();
        } catch (err) {
            if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) {
                logServiceError(
                    serviceLogger,
                    err,
                    {
                        operation: 'warehouse.materials.materialHelpers.withRetry',
                        attempts,
                        level: 'debug'
                    },
                    'Reintentando operación por conflicto de unicidad'
                );

                attempts++;
                continue;
            }

            logServiceError(
                serviceLogger,
                err,
                { operation: 'warehouse.materials.materialHelpers.withRetry', level: 'error' }
            );

            throw err;
        }
    }

    throw new ExcededMaxRetriesSkuError();
};

export const DEFAULT_MATERIAL_SNAPSHOT_SELECT = {
    id: true,
    type: true,
    name: true,
    presentation: { select: { name: true } },
    base: true,
    height: true
};

export const throwMaterialWriteError = ({ err, fallbackError }) => {
    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new MaterialNotFound();
    }

    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) {
        throw new MaterialAlreadyExists();
    }

    throw resolveServiceError(err, fallbackError);
};

export const buildMaterialData = ({ rest, relations }) => ({
    ...rest,
    presentation: {
        connect: { id: relations.presentationId }
    },
    unitMeasure: {
        connect: { id: relations.unitMeasureId }
    }
});

export const findMaterialByIdentity = ({ tx, rest, relations, excludeId }) => tx.material.findFirst({
    where: {
        ...(excludeId && { id: { not: excludeId } }),
        name: { equals: rest.name, mode: 'insensitive' },
        presentationId: relations.presentationId,
        unitMeasureId: relations.unitMeasureId,
        base: rest.base ?? null,
        height: rest.height ?? null,
        type: rest.type ?? MATERIAL_TYPES.MATERIAL
    },
    select: { id: true }
});
