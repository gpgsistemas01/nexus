import { createStockAdjustmentByQuantityChange } from '../../adjustmentService.js';

export const GOODS_RECEIPT_DETAIL_STATUS = Object.freeze({
    ACTIVE: 'ACTIVE',
    CANCELED: 'CANCELED'
});

export const findReceiptDetailForChange = ({ tx, goodsReceiptId, detailId }) => (
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

export const createGoodsReceiptDetailChangeAdjustment = async ({
    tx,
    currentDetail,
    resultingQuantity,
    reasonId,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId,
    observations
}) => {
    const quantityDifference = Number(resultingQuantity) - Number(currentDetail.quantity);

    if (quantityDifference === 0) return null;

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
        observations
    });
};

export const createGoodsReceiptDetailChange = async ({
    tx,
    currentDetail,
    resultingDetail,
    reasonId,
    stockAdjustmentId,
    changeType,
    goodsReceiptId,
    goodsReceiptDetailId
}) => {
    const change = await tx.goodsReceiptDetailChange.create({
        data: {
            goodsReceiptId,
            goodsReceiptDetailId,
            reasonId,
            stockAdjustmentId,
            previousProductId: currentDetail.productId,
            previousProductName: currentDetail.productName,
            previousQuantity: currentDetail.quantity,
            previousCostPerUnitType: currentDetail.costPerUnitType,
            previousNetPurchaseAmount: currentDetail.netPurchaseAmount,
            previousGrossPurchaseAmount: currentDetail.grossPurchaseAmount,
            correctedProductId: resultingDetail.productId,
            correctedProductName: resultingDetail.productName,
            correctedQuantity: resultingDetail.quantity,
            correctedCostPerUnitType: resultingDetail.costPerUnitType,
            correctedNetPurchaseAmount: resultingDetail.netPurchaseAmount,
            correctedGrossPurchaseAmount: resultingDetail.grossPurchaseAmount,
            changeType,
            productChanged: false,
            quantityDifference: Number(resultingDetail.quantity) - Number(currentDetail.quantity),
            costDifference: Number(resultingDetail.costPerUnitType) - Number(currentDetail.costPerUnitType)
        }
    });

    return tx.goodsReceiptDetailChange.findUnique({
        where: { id: change.id },
        include: {
            stockAdjustment: true
        }
    });
};
