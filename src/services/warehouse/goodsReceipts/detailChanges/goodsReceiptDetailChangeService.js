import { INVENTORY_MOVEMENT_TYPES } from '../../../../constants/inventory.js';
import { createInventoryMovement } from '../../../inventory/movementService.js';
import { buildInventoryMovementDetail } from '../../../inventory/movementHelpers.js';
import { assertSufficientStock, calculateConvertedQuantity } from '../../../inventory/stockHelpers.js';
import { normalizeDecimal } from '../../../../utils/formattersUtils.js';
import {
    adjustSupplierMaterialStock,
    findSupplierMaterialByIds
} from '../../materials/supplierMaterialService.js';

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

    const supplierId = currentDetail.goodsReceipt.supplierId;
    const supplierMaterial = await findSupplierMaterialByIds({
        tx,
        materialId: currentDetail.materialId,
        supplierId
    });
    const previousStock = normalizeDecimal(supplierMaterial.currentStock ?? 0);
    const previousConvertedQuantity = normalizeDecimal(supplierMaterial.convertedQuantity ?? 0);
    const convertedDifference = calculateConvertedQuantity({
        quantity: normalizedQuantityDifference,
        base: currentDetail.material.base,
        height: currentDetail.material.height
    });
    const newStock = normalizeDecimal(previousStock + normalizedQuantityDifference);
    const newConvertedQuantity = normalizeDecimal(previousConvertedQuantity + convertedDifference);

    assertSufficientStock({
        material: supplierMaterial,
        newStock,
        newConvertedQuantity,
        requestedQuantity: Math.abs(normalizedQuantityDifference)
    });

    const movement = await createInventoryMovement({
        tx,
        movementType: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
        reference: { goodsReceiptId },
        details: [buildInventoryMovementDetail({
            materialId: currentDetail.materialId,
            supplierId,
            quantity: normalizedQuantityDifference,
            previousStock,
            newStock,
            materialBase: currentDetail.material.base,
            materialHeight: currentDetail.material.height,
            goodsReceiptDetailId
        })]
    });

    await adjustSupplierMaterialStock({
        tx,
        materialId: currentDetail.materialId,
        supplierId,
        newStock,
        newConvertedQuantity
    });

    return movement;
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
            changedBy: {
                connect: { id: changedById }
            },
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
