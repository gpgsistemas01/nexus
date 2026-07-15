import { ExcededMaxRetriesSkuError } from "../../../errors/warehouse/productError.js";
import { findUniquePresentation } from "../presentationService.js";
import { findUniqueUnitMeasure } from "../unitMeasureService.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";

const serviceLogger = createServiceLogger('warehouse.products.productHelpers');


const MAX_RETRIES = 5;

export const prepareProductData = async ({ tx, productDto, productId = null }) => {

    const { presentationId, unitMeasureId, supplierId, maxUnitCost, ...rest } = productDto;

    await findUniqueUnitMeasure({ tx, id: unitMeasureId });
    await findUniquePresentation({ tx, id: presentationId });

    return {
        rest,
        relations: {
            presentationId,
            unitMeasureId,
            supplierId,
            maxUnitCost
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
                        operation: 'warehouse.products.productHelpers.withRetry',
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
                { operation: 'warehouse.products.productHelpers.withRetry', level: 'error' }
            );

            throw err;
        }
    }

    throw new ExcededMaxRetriesSkuError();
};
