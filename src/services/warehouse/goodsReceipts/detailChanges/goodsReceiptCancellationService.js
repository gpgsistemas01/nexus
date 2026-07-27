import { isAppError } from '../../../../errors/AppError.js';
import { GOODS_RECEIPT_DETAIL_CHANGE_TYPES } from '../../../../constants/goodsReceiptDetailChanges.js';
import { GoodsIssueInsufficientStock } from '../../../../errors/inventory/stockError.js';
import {
    GoodsReceiptCorrectionInsufficientStock,
    GoodsReceiptDetailChangeReasonNotFound,
    GoodsReceiptDetailAlreadyCanceled,
    GoodsReceiptNotFound,
    GoodsReceiptUpdateDatabaseError
} from '../../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../../repository/baseRepository.js';
import { createServiceLogger, getModelLogContext, logServiceError } from '../../../../utils/logger.js';
import { updateGoodsReceiptDetailAndTotals } from '../goodsReceiptHelpers.js';
import {
    createGoodsReceiptDetailChange,
    createGoodsReceiptDetailChangeAdjustment,
    findReceiptDetailForChange,
    GOODS_RECEIPT_DETAIL_STATUS
} from './goodsReceiptDetailChangeService.js';
import { findGoodsReceiptDetailChangeReason } from '../../reasonService.js';

const serviceLogger = createServiceLogger('warehouse.goodsReceipts.detailChanges.goodsReceiptCancellationService');

export const cancelGoodsReceiptDetailLine = async ({ id, detailId, userId }) => {
    try {
        return await getDb().$transaction(async (tx) => {
            const currentDetail = await findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId });

            if (!currentDetail) throw new GoodsReceiptNotFound();
            if (currentDetail.status === GOODS_RECEIPT_DETAIL_STATUS.CANCELED) {
                throw new GoodsReceiptDetailAlreadyCanceled();
            }
            const changeType = GOODS_RECEIPT_DETAIL_CHANGE_TYPES.CANCELLATION;
            const cancellationReason = await findGoodsReceiptDetailChangeReason({ tx, changeType });
            if (!cancellationReason) throw new GoodsReceiptDetailChangeReasonNotFound();

            const canceledDetailSnapshot = {
                productId: currentDetail.productId,
                productName: currentDetail.productName,
                quantity: 0,
                costPerUnitType: currentDetail.costPerUnitType,
                netPurchaseAmount: 0,
                grossPurchaseAmount: 0
            };
            const receiptReference = currentDetail.goodsReceipt.referenceNumber || id;
            const adjustment = await createGoodsReceiptDetailChangeAdjustment({
                tx,
                currentDetail,
                resultingQuantity: canceledDetailSnapshot.quantity,
                reasonId: cancellationReason.id,
                userId,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId,
                observations: `Cancelación de detalle de compra ${receiptReference}. Ajuste de salida por cancelación del detalle.`
            });
            const { updatedDetail, updatedReceipt } = await updateGoodsReceiptDetailAndTotals({
                tx,
                goodsReceiptId: id,
                detailId,
                correctedDetail: { status: GOODS_RECEIPT_DETAIL_STATUS.CANCELED }
            });
            const detailChange = await createGoodsReceiptDetailChange({
                tx,
                currentDetail,
                resultingDetail: canceledDetailSnapshot,
                reasonId: cancellationReason.id,
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
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsReceipts.detailChanges.goodsReceiptCancellationService.cancelGoodsReceiptDetailLine',
            ...getModelLogContext('goodsReceiptDetailChange', { id, detailId })
        });

        if (err instanceof GoodsIssueInsufficientStock) {
            throw new GoodsReceiptCorrectionInsufficientStock(err.meta);
        }
        if (isAppError(err)) throw err;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
