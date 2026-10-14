import { ExcededMaxRetriesSkuError, MaterialRollReferenceInvalid, MaterialRollReferenceReadOnly } from "../../../errors/warehouse/materialError.js";
import { findUniquePresentation } from "../presentationService.js";
import { findUniqueUnitMeasure } from "../unitMeasureService.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findUniqueSupplier } from "../supplierService.js";
import { SupplierInactiveConflict } from "../../../errors/warehouse/supplierError.js";

import { isRollPresentation } from '../../../public/js/utils/warehouseInventoryUtils.js';
import { MATERIAL_TYPES } from '../../../constants/inventory.js';

const serviceLogger = createServiceLogger('warehouse.materials.materialHelpers');


const MAX_RETRIES = 5;

export const assertMaterialRollReference = ({ material, referenceConeWeightKg, referenceRollTotalWeightKg, savedReference = null }) => {
    if ((referenceConeWeightKg != null || referenceRollTotalWeightKg != null)
        && (material.type === MATERIAL_TYPES.CONSUMABLE || !isRollPresentation(material.presentation?.name))) {
        throw new MaterialRollReferenceInvalid();
    }

    if (!savedReference) return;

    // RF-MER-012: se pueden completar pesos ausentes, pero no cambiar ni borrar los registrados.
    for (const [field, nextWeight] of Object.entries({ referenceConeWeightKg, referenceRollTotalWeightKg })) {
        const registeredWeight = savedReference[field];
        if (nextWeight === undefined || registeredWeight == null) continue;

        const removesWeight = nextWeight === null;
        const changesWeight = Number(nextWeight) !== Number(registeredWeight);
        if (removesWeight || changesWeight) throw new MaterialRollReferenceReadOnly();
    }
};

export const prepareMaterialData = async ({ tx, materialDto, materialId = null }) => {

    const { presentationId, unitMeasureId, supplierId, maxUnitCost, isActive, referenceConeWeightKg, referenceRollTotalWeightKg, ...rest } = materialDto;

    const [, presentation, supplier] = await Promise.all([
        findUniqueUnitMeasure({ tx, id: unitMeasureId }),
        findUniquePresentation({ tx, id: presentationId }),
        findUniqueSupplier({ tx, id: supplierId })
    ]);

    assertMaterialRollReference({ material: { ...rest, presentation }, referenceConeWeightKg, referenceRollTotalWeightKg });

    if (supplier?.isActive === false) throw new SupplierInactiveConflict();

    return {
        rest,
        relations: {
            presentationId,
            unitMeasureId,
            supplierId,
            maxUnitCost,
            isActive,
            ...(referenceConeWeightKg !== undefined && { referenceConeWeightKg }),
            ...(referenceRollTotalWeightKg !== undefined && { referenceRollTotalWeightKg })
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
                        level: 'warn'
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
