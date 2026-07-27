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
import { updateProductUnitCostIfHigher } from '../../products/supplierProductService.js';
import { buildGoodsReceiptDetails, updateGoodsReceiptDetailAndTotals } from '../goodsReceiptHelpers.js';
import {
    createGoodsReceiptDetailChange,
    createGoodsReceiptDetailChangeAdjustment,
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
                productId: currentDetail.productId,
                quantity,
                costPerUnitType
            }], { tx });
            const quantityDifference = Number(correctedDetail.quantity) - Number(currentDetail.quantity);
            const costDifference = Number(correctedDetail.costPerUnitType) - Number(currentDetail.costPerUnitType);
            const hasQuantityChange = quantityDifference !== 0;
            const hasCostChange = costDifference !== 0;
            const hasQuantityAndCostChange = hasQuantityChange && hasCostChange;

            if (Number(correctedDetail.quantity) <= 0 || Number(correctedDetail.quantity) > Number(currentDetail.quantity)) {
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

            const receiptReference = currentDetail.goodsReceipt.referenceNumber || id;
            const adjustmentDirection = quantityDifference > 0
                ? 'Ajuste de entrada por aumento de cantidad.'
                : 'Ajuste de salida por disminución de cantidad.';
            const adjustmentObservations = `Corrección de compra ${receiptReference}; campos afectados: cantidad. ${adjustmentDirection}`;
            const adjustment = await createGoodsReceiptDetailChangeAdjustment({
                tx,
                currentDetail,
                resultingQuantity: correctedDetail.quantity,
                reasonId: correctionReason.id,
                userId,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId,
                observations: adjustmentObservations
            });
            const { updatedDetail, updatedReceipt } = await updateGoodsReceiptDetailAndTotals({
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
                stockAdjustmentId: adjustment?.id || null,
                changeType,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId
            });

            return {
                updatedDetail,
                updatedReceipt,
                detailChange,
                adjustment
            };
        });

        await updateProductUnitCostIfHigher({
            supplierId: result.updatedReceipt.supplierId,
            details: [result.updatedDetail]
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
