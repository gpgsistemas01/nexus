import { isAppError } from '../../../errors/AppError.js';
import { GoodsIssueInsufficientStock } from '../../../errors/inventory/stockError.js';
import {
    GoodsReceiptCorrectionInsufficientStock,
    GoodsReceiptCorrectionNoChanges,
    GoodsReceiptCorrectionQuantityConflict,
    GoodsReceiptCorrectionReasonNotFound,
    GoodsReceiptNotFound,
    GoodsReceiptUpdateDatabaseError
} from '../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { createServiceLogger, getModelLogContext, logServiceError } from '../../../utils/logger.js';
import { createStockAdjustmentByQuantityChange } from '../adjustmentService.js';
import { updateProductUnitCostIfHigher } from '../products/supplierProductService.js';
import { buildGoodsReceiptDetails, updateGoodsReceiptDetailAndTotals } from '../goodsReceipts/goodsReceiptHelpers.js';
import { findGoodsReceiptCorrectionReason } from '../reasonService.js';

const serviceLogger = createServiceLogger('warehouse.corrections.goodsReceiptCorrectionService');

const GOODS_RECEIPT_CORRECTION_MODES = Object.freeze({
    UPDATE: 'UPDATE',
    CANCEL_DETAIL: 'CANCEL_DETAIL'
});

const GOODS_RECEIPT_DETAIL_STATUS = Object.freeze({
    ACTIVE: 'ACTIVE',
    CANCELED: 'CANCELED'
});

const findReceiptDetailForCorrection = ({ tx, goodsReceiptId, detailId }) => (
    tx.goodsReceiptDetail.findFirst({
        where: {
            id: detailId,
            goodsReceiptId
        },
        include: {
            goodsReceipt: true
        }
    })
);

const createGoodsReceiptCorrectionAdjustment = async ({
    tx,
    currentDetail,
    correctedDetail,
    reasonId,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
}) => {
    const quantityDifference = Number(correctedDetail.quantity) - Number(currentDetail.quantity);

    if (quantityDifference === 0) return null;

    const receiptReference = currentDetail.goodsReceipt.referenceNumber || goodsReceiptId;
    const correctionContext = `Corrección de compra ${receiptReference}; campos afectados: cantidad.`;

    return createStockAdjustmentByQuantityChange({
        tx,
        supplierId: currentDetail.goodsReceipt.supplierId,
        reasonId,
        userId,
        goodsReceiptId,
        goodsReceiptDetailId,
        returnAdjustment: true,
        productId: currentDetail.productId,
        quantityChange: quantityDifference,
        base: currentDetail.productBase,
        height: currentDetail.productHeight,
        observations: quantityDifference > 0
            ? `${correctionContext} Ajuste de entrada por aumento de cantidad.`
            : `${correctionContext} Ajuste de salida por disminución de cantidad.`
    });
};

export const correctGoodsReceiptDetailLine = async ({
    id,
    detailId,
    correctionDto,
    userId,
    correctionMode = GOODS_RECEIPT_CORRECTION_MODES.UPDATE
}) => {
    const { quantity, costPerUnitType } = correctionDto;

    try {
        const db = getDb();

        const result = await db.$transaction(async (tx) => {
            const [currentDetail, correctionReason] = await Promise.all([
                findReceiptDetailForCorrection({
                    tx,
                    goodsReceiptId: id,
                    detailId
                }),
                findGoodsReceiptCorrectionReason({ tx })
            ]);

            if (!currentDetail) throw new GoodsReceiptNotFound();
            if (!correctionReason) throw new GoodsReceiptCorrectionReasonNotFound();

            const [correctedDetail] = await buildGoodsReceiptDetails([{
                productId: currentDetail.productId,
                quantity,
                costPerUnitType
            }], { tx });
            const correctedQuantity = Number(correctedDetail.quantity);
            const currentQuantity = Number(currentDetail.quantity);

            if (correctedQuantity < 0 || correctedQuantity > currentQuantity) {
                throw new GoodsReceiptCorrectionQuantityConflict();
            }

            const effectiveCorrectionMode = correctionMode === GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL || correctedQuantity === 0
                ? GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL
                : GOODS_RECEIPT_CORRECTION_MODES.UPDATE;
            const quantityDifference = correctedQuantity - currentQuantity;
            const costDifference = Number(correctedDetail.costPerUnitType) - Number(currentDetail.costPerUnitType);
            const hasChanges = quantityDifference !== 0 || costDifference !== 0;

            if (!hasChanges) throw new GoodsReceiptCorrectionNoChanges();

            const correctionType = effectiveCorrectionMode === GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL
                ? GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL
                : [
                    quantityDifference !== 0 ? 'QUANTITY' : null,
                    costDifference !== 0 ? 'COST' : null
                ].filter(Boolean).join('_AND_');

            const adjustment = await createGoodsReceiptCorrectionAdjustment({
                tx,
                currentDetail,
                correctedDetail,
                reasonId: correctionReason.id,
                userId,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId
            });
            const detailUpdate = effectiveCorrectionMode === GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL
                ? { ...correctedDetail, status: GOODS_RECEIPT_DETAIL_STATUS.CANCELED }
                : correctedDetail;
            const { updatedDetail, updatedReceipt } = await updateGoodsReceiptDetailAndTotals({
                tx,
                goodsReceiptId: id,
                detailId,
                correctedDetail: detailUpdate
            });
            const correction = await tx.goodsReceiptCorrection.create({
                data: {
                    goodsReceiptId: id,
                    goodsReceiptDetailId: detailId,
                    reasonId: correctionReason.id,
                    stockAdjustmentId: adjustment?.id || null,
                    previousProductId: currentDetail.productId,
                    previousProductName: currentDetail.productName,
                    previousQuantity: currentDetail.quantity,
                    previousCostPerUnitType: currentDetail.costPerUnitType,
                    previousNetPurchaseAmount: currentDetail.netPurchaseAmount,
                    previousGrossPurchaseAmount: currentDetail.grossPurchaseAmount,

                    correctedProductId: correctedDetail.productId,
                    correctedProductName: correctedDetail.productName,
                    correctedQuantity: correctedDetail.quantity,
                    correctedCostPerUnitType: correctedDetail.costPerUnitType,
                    correctedNetPurchaseAmount: correctedDetail.netPurchaseAmount,
                    correctedGrossPurchaseAmount: correctedDetail.grossPurchaseAmount,

                    correctionType,
                    productChanged: false,
                    quantityDifference,
                    costDifference
                }
            });

            const correctionWithAdjustment = await tx.goodsReceiptCorrection.findUnique({
                where: { id: correction.id },
                include: {
                    stockAdjustment: true
                }
            });

            return {
                updatedDetail,
                updatedReceipt,
                correction: correctionWithAdjustment,
                adjustment,
                correctionMode: effectiveCorrectionMode,
                costDifference: Number(correctedDetail.netPurchaseAmount) - Number(currentDetail.netPurchaseAmount)
            };
        });

        if (result.correctionMode !== GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL) {
            await updateProductUnitCostIfHigher({
                supplierId: result.updatedReceipt.supplierId,
                details: [result.updatedDetail]
            });
        }

        return result;
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.corrections.goodsReceiptCorrectionService.correctGoodsReceiptDetailLine',
            ...getModelLogContext('goodsReceiptCorrection', { id, ...correctionDto })
        });

        if (err instanceof GoodsIssueInsufficientStock) {
            throw new GoodsReceiptCorrectionInsufficientStock(err.meta);
        }

        if (isAppError(err)) throw err;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};

export const cancelGoodsReceiptDetailLine = async ({ id, detailId, userId }) => {
    return correctGoodsReceiptDetailLine({
        id,
        detailId,
        userId,
        correctionMode: GOODS_RECEIPT_CORRECTION_MODES.CANCEL_DETAIL,
        correctionDto: {
            quantity: 0,
            costPerUnitType: 0
        }
    });
};
