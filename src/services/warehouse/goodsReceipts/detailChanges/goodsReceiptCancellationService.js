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
import { normalizeDecimal } from '../../../../utils/formattersUtils.js';
import { cancelGoodsReceiptDetailAndTotals } from '../goodsReceiptHelpers.js';
import {
    createGoodsReceiptDetailChange,
    createGoodsReceiptDetailChangeMovementAndUpdateStock,
    findReceiptDetailForChange,
    GOODS_RECEIPT_DETAIL_STATUS
} from './goodsReceiptDetailChangeService.js';
import { findGoodsReceiptDetailChangeReason } from '../../reasonService.js';
import { recalculateMaterialUnitCosts } from '../../materials/supplierMaterialService.js';

const serviceLogger = createServiceLogger('warehouse.goodsReceipts.detailChanges.goodsReceiptCancellationService');

export const cancelGoodsReceiptDetailLine = async ({ id, detailId }) => {
    try {
        const result = await getDb().$transaction(async (tx) => {
            const currentDetail = await findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId });

            if (!currentDetail) throw new GoodsReceiptNotFound();
            if (currentDetail.status === GOODS_RECEIPT_DETAIL_STATUS.CANCELED) {
                throw new GoodsReceiptDetailAlreadyCanceled();
            }
            const changeType = GOODS_RECEIPT_DETAIL_CHANGE_TYPES.CANCELLATION;
            const cancellationReason = await findGoodsReceiptDetailChangeReason({ tx, changeType });
            if (!cancellationReason) throw new GoodsReceiptDetailChangeReasonNotFound();

            const canceledDetailSnapshot = {
                materialId: currentDetail.materialId,
                materialName: currentDetail.materialName,
                quantity: currentDetail.quantity,
                costPerUnitType: currentDetail.costPerUnitType,
                netPurchaseAmount: currentDetail.netPurchaseAmount,
                grossPurchaseAmount: currentDetail.grossPurchaseAmount
            };
            const quantityDifference = normalizeDecimal(-canceledDetailSnapshot.quantity);
            const movement = await createGoodsReceiptDetailChangeMovementAndUpdateStock({
                tx,
                currentDetail,
                quantityDifference,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId
            });
            const { updatedDetail, updatedReceipt } = await cancelGoodsReceiptDetailAndTotals({
                tx,
                goodsReceiptId: id,
                detailId
            });
            const detailChange = await createGoodsReceiptDetailChange({
                tx,
                currentDetail,
                resultingDetail: canceledDetailSnapshot,
                reasonId: cancellationReason.id,
                inventoryMovementId: movement.id,
                changeType,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId,
                quantityDifference
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
