import { ExcededMaxRetriesSkuError, MaterialRollReferenceReadOnly } from "../../../errors/warehouse/materialError.js";
import { findUniquePresentation } from "../presentationService.js";
import { findUniqueUnitMeasure } from "../unitMeasureService.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findUniqueSupplier } from "../supplierService.js";
import { SupplierInactiveConflict } from "../../../errors/warehouse/supplierError.js";


const serviceLogger = createServiceLogger('warehouse.materials.materialHelpers');


const MAX_RETRIES = 5;

export const assertMaterialRollReference = ({ referenceConeWeightKg, referenceRollTotalWeightKg }) => {
    if (referenceConeWeightKg !== undefined || referenceRollTotalWeightKg !== undefined) {
        throw new MaterialRollReferenceReadOnly();
    }
};

export const prepareMaterialData = async ({ tx, materialDto, materialId = null }) => {

    const { presentationId, unitMeasureId, supplierId, maxUnitCost, isActive, referenceConeWeightKg, referenceRollTotalWeightKg, ...rest } = materialDto;

    // La transacción comparte una conexión: cada consulta debe terminar antes de enviar la siguiente.
    await findUniqueUnitMeasure({ tx, id: unitMeasureId });
    await findUniquePresentation({ tx, id: presentationId });
    const supplier = await findUniqueSupplier({ tx, id: supplierId });

    assertMaterialRollReference({ referenceConeWeightKg, referenceRollTotalWeightKg });

    if (supplier?.isActive === false) throw new SupplierInactiveConflict();

    return {
        rest,
        relations: {
            presentationId,
            unitMeasureId,
            supplierId,
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
