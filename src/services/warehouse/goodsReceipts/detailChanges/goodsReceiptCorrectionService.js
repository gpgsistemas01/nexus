import { isAppError } from '../../../../errors/AppError.js';
import { GOODS_RECEIPT_DETAIL_CHANGE_TYPES } from '../../../../constants/goodsReceiptDetailChanges.js';
import { GoodsIssueInsufficientStock } from '../../../../errors/inventory/stockError.js';
import {
    GoodsReceiptCorrectionInsufficientStock,
    GoodsReceiptCorrectionNoChanges,
    GoodsReceiptCorrectionQuantityConflict,
    GoodsReceiptDetailChangeReasonNotFound,
    GoodsReceiptDetailAlreadyCanceled,
    GoodsReceiptNotFound,
    GoodsReceiptUpdateDatabaseError
} from '../../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../../repository/baseRepository.js';
import { createServiceLogger, getModelLogContext, logServiceError } from '../../../../utils/logger.js';
import { normalizeDecimal } from '../../../../utils/formattersUtils.js';
import { recalculateMaterialUnitCosts } from '../../materials/supplierMaterialService.js';
import { buildGoodsReceiptDetails, correctGoodsReceiptDetailAndTotals } from '../goodsReceiptHelpers.js';
import {
    createGoodsReceiptDetailChange,
    createGoodsReceiptDetailChangeMovementAndUpdateStock,
    findReceiptDetailForChange,
    GOODS_RECEIPT_DETAIL_STATUS
} from './goodsReceiptDetailChangeService.js';
import { findGoodsReceiptDetailChangeReason } from '../../reasonService.js';

const serviceLogger = createServiceLogger('warehouse.goodsReceipts.detailChanges.goodsReceiptCorrectionService');

export const correctGoodsReceiptDetailLine = async ({
    id,
    detailId,
    correctionDto,
    userId
}) => {
    const { quantity, costPerUnitType } = correctionDto;

    try {
        const result = await getDb().$transaction(async (tx) => {
            const currentDetail = await findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId });

            if (!currentDetail) throw new GoodsReceiptNotFound();
            if (currentDetail.status === GOODS_RECEIPT_DETAIL_STATUS.CANCELED) {
                throw new GoodsReceiptDetailAlreadyCanceled();
            }
            const [correctedDetail] = await buildGoodsReceiptDetails([{
                materialId: currentDetail.materialId,
                quantity,
                costPerUnitType
            }], { tx });
            const correctedQuantity = normalizeDecimal(correctedDetail.quantity);
            const currentQuantity = normalizeDecimal(currentDetail.quantity);
            const quantityDifference = normalizeDecimal(correctedQuantity - currentQuantity);
            const costDifference = normalizeDecimal(correctedDetail.costPerUnitType - currentDetail.costPerUnitType);
            const hasQuantityChange = quantityDifference !== 0;
            const hasCostChange = costDifference !== 0;
            const hasQuantityAndCostChange = hasQuantityChange && hasCostChange;

            if (correctedQuantity <= 0 || correctedQuantity > currentQuantity) {
                throw new GoodsReceiptCorrectionQuantityConflict();
            }
            if (!hasQuantityChange && !hasCostChange) {
                throw new GoodsReceiptCorrectionNoChanges();
            }

            let changeType = GOODS_RECEIPT_DETAIL_CHANGE_TYPES.COST;
            if (hasQuantityAndCostChange) {
                changeType = GOODS_RECEIPT_DETAIL_CHANGE_TYPES.QUANTITY_AND_COST;
            } else if (hasQuantityChange) {
                changeType = GOODS_RECEIPT_DETAIL_CHANGE_TYPES.QUANTITY;
            }
            const correctionReason = await findGoodsReceiptDetailChangeReason({ tx, changeType });
            if (!correctionReason) throw new GoodsReceiptDetailChangeReasonNotFound();

            const movement = await createGoodsReceiptDetailChangeMovementAndUpdateStock({
                tx,
                currentDetail,
                quantityDifference,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId
            });
            const { updatedDetail, updatedReceipt } = await correctGoodsReceiptDetailAndTotals({
                tx,
                goodsReceiptId: id,
                detailId,
                correctedDetail
            });
            const detailChange = await createGoodsReceiptDetailChange({
                tx,
                currentDetail,
                resultingDetail: correctedDetail,
                reasonId: correctionReason.id,
                inventoryMovementId: movement?.id || null,
                changeType,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId,
                changedById: userId
            });

            return {
                updatedDetail,
                updatedReceipt,
                detailChange,
                movement
            };
        });

        await recalculateMaterialUnitCosts({
            supplierId: result.updatedReceipt.supplierId,
            materialIds: [result.updatedDetail.materialId]
        });

        return result;
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsReceipts.detailChanges.goodsReceiptCorrectionService.correctGoodsReceiptDetailLine',
            ...getModelLogContext('goodsReceiptDetailChange', { id, ...correctionDto })
        });

        if (err instanceof GoodsIssueInsufficientStock) {
            throw new GoodsReceiptCorrectionInsufficientStock(err.meta);
        }
        if (isAppError(err)) throw err;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
