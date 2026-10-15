import { buildGoodsReceiptContextWhere } from '../goodsReceiptHelpers.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../../constants/inventory.js';
import { applyInventoryMovement } from '../../../inventory/movementService.js';
import { normalizeDecimal } from '../../../../utils/formattersUtils.js';

export const GOODS_RECEIPT_DETAIL_STATUS = Object.freeze({
    ACTIVE: 'ACTIVE',
    CANCELED: 'CANCELED'
});

export const findReceiptDetailForChange = ({ tx, goodsReceiptId, detailId, type = null }) => (
    tx.goodsReceiptDetail.findFirst({
        where: {
            id: detailId,
            goodsReceiptId,
            ...(type && { goodsReceipt: buildGoodsReceiptContextWhere(type) })
        },
        include: {
            goodsReceipt: true,
            material: true
        }
    })
);

export const createGoodsReceiptDetailChangeMovementAndUpdateStock = async ({
    tx,
    currentDetail,
    quantityDifference,
    goodsReceiptId,
    goodsReceiptDetailId
}) => {
    const normalizedQuantityDifference = normalizeDecimal(quantityDifference);

    if (normalizedQuantityDifference === 0) return null;

    return applyInventoryMovement({
        tx,
        movementType: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
        reference: { goodsReceiptId },
        details: [{
            materialId: currentDetail.materialId,
            supplierId: currentDetail.goodsReceipt.supplierId,
            quantity: normalizedQuantityDifference,
            goodsReceiptDetailId
        }]
    });
};

export const createGoodsReceiptDetailChange = async ({
    tx,
    currentDetail,
    resultingDetail,
    reasonId,
    inventoryMovementId,
    changeType,
    goodsReceiptId,
    goodsReceiptDetailId,
    changedById,
    quantityDifference = normalizeDecimal(resultingDetail.quantity - currentDetail.quantity)
}) => {
    return tx.goodsReceiptDetailChange.create({
        data: {
            goodsReceiptId,
            goodsReceiptDetailId,
            changedById,
            reasonId,
            inventoryMovementId,
            previousMaterialId: currentDetail.materialId,
            previousMaterialName: currentDetail.materialName,
            previousQuantity: currentDetail.quantity,
            previousCostPerUnitType: currentDetail.costPerUnitType,
            previousNetPurchaseAmount: currentDetail.netPurchaseAmount,
            previousGrossPurchaseAmount: currentDetail.grossPurchaseAmount,
            correctedMaterialId: resultingDetail.materialId,
            correctedMaterialName: resultingDetail.materialName,
            correctedQuantity: resultingDetail.quantity,
            correctedCostPerUnitType: resultingDetail.costPerUnitType,
            correctedNetPurchaseAmount: resultingDetail.netPurchaseAmount,
            correctedGrossPurchaseAmount: resultingDetail.grossPurchaseAmount,
            changeType,
            materialChanged: false,
            quantityDifference,
            costDifference: normalizeDecimal(resultingDetail.costPerUnitType - currentDetail.costPerUnitType)
        },
        include: {
            inventoryMovement: true,
            changedBy: {
                select: {
                    id: true,
                    name: true,
                    personId: true
                }
            }
        }
    });
};
