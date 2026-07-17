import { AppError } from '../../../errors/AppError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { createServiceLogger, getModelLogContext, logServiceError } from '../../../utils/logger.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';
import { findReturnedQuantityTotalsByDetailIds, RETURN_DOCUMENT_CONFIGS } from './returnHelpers.js';

const serviceLogger = createServiceLogger('warehouse.returns.returnService');
const FLOAT_EPSILON = 0.000001;

const returnDocumentProducts = async ({ id, details = [], userId, config }) => {
    const requestedByDetailId = new Map();
    const detailIds = [];

    details.forEach((detail) => {
        if (!detail.isReturned) return;

        requestedByDetailId.set(detail.id, detail);
        detailIds.push(detail.id);
    });

    try {
        return await getDb().$transaction(async (tx) => {
            const document = await tx[config.modelName].findUnique({
                where: { id },
                select: {
                    id: true,
                    ...config.documentSelect,
                    details: {
                        where: { id: { in: detailIds } },
                        select: config.detailSelect
                    }
                }
            });

            if (!document) throw new config.NotFoundError();
            if (document.details.length !== detailIds.length) {
                throw new config.DetailNotFoundError();
            }

            const returnedByDetailId = await findReturnedQuantityTotalsByDetailIds({
                tx,
                detailIds,
                detailField: config.detailReturnField,
                normalizeTotal: config.normalizeReturnedTotal
            });
            const adjustments = [];

            for (const current of document.details) {
                const requested = requestedByDetailId.get(current.id);
                if (!requested) continue;

                const returnedQuantity = normalizeDecimal(requested.returnedQuantity ?? 0);
                const baseQuantity = normalizeDecimal(current[config.quantityField] ?? 0);
                const alreadyReturned = returnedByDetailId.get(current.id) ?? 0;

                if (returnedQuantity <= FLOAT_EPSILON) throw new config.InvalidQuantityError();

                const totalReturned = normalizeDecimal(alreadyReturned + returnedQuantity);
                const QuantityExceededError = config.QuantityExceededError ?? config.InvalidQuantityError;

                if (totalReturned > baseQuantity + FLOAT_EPSILON) throw new QuantityExceededError();

                const adjustment = await config.createAdjustment({
                    tx,
                    productId: current.productId,
                    supplierId: config.getSupplierId({ document, detail: current }),
                    observations: null,
                    returnedQuantity,
                    userId,
                    ...config.buildDocumentLink({ document, detail: current })
                });

                returnedByDetailId.set(current.id, totalReturned);
                adjustments.push(adjustment);
            }

            return {
                [config.resultKey]: document.id,
                adjustments
            };
        });
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: config.operation,
            ...getModelLogContext(config.logModel, { id, details, userId })
        });

        const mappedError = config.mapError?.(err) ?? err;

        if (mappedError instanceof AppError) throw mappedError;

        throw new config.UpdateError();
    }
};

export const returnGoodsIssueProducts = async ({ id, goodsIssueDto, userId }) => (
    returnDocumentProducts({
        id,
        details: goodsIssueDto.details,
        userId,
        config: RETURN_DOCUMENT_CONFIGS.goodsIssue
    })
);
