import { normalizeDatabaseError } from '../../../../errors/databaseError.js';
import { lockSupplierMaterialStock } from '../../../../repository/warehouse/stockLockRepository.js';
import { lockGoodsReceipt } from '../../../../repository/warehouse/documentLockRepository.js';
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
import { calculateGoodsReceiptDetail } from '../goodsReceiptHelpers.js';
import { correctGoodsReceiptDetailAndTotals } from '../goodsReceiptTotalsService.js';
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
    userId,
    type = null
}) => {
    const { quantity, costPerUnitType } = correctionDto;

    try {
        const result = await getDb().$transaction(async (tx) => {
            await lockGoodsReceipt({ tx, id });
            const currentDetail = await findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId, type });

            if (!currentDetail) throw new GoodsReceiptNotFound();
            if (currentDetail.status === GOODS_RECEIPT_DETAIL_STATUS.CANCELED) {
                throw new GoodsReceiptDetailAlreadyCanceled();
            }
            await lockSupplierMaterialStock({
                tx,
                materialId: currentDetail.materialId,
                supplierId: currentDetail.goodsReceipt.supplierId
            });
            const correctedDetail = calculateGoodsReceiptDetail({
                material: currentDetail.material,
                detail: { quantity, costPerUnitType }
            });
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

            await recalculateMaterialUnitCosts({
                tx,
                supplierId: updatedReceipt.supplierId,
                materialIds: [updatedDetail.materialId]
            });

            return {
                updatedDetail,
                updatedReceipt,
                detailChange,
                movement
            };
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
        const normalizedError = normalizeDatabaseError(err);
        if (isAppError(normalizedError)) throw normalizedError;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
