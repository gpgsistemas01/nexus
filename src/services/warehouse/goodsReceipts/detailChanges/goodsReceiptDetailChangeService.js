import { INVENTORY_MOVEMENT_TYPES } from '../../../../constants/inventory.js';
import { createInventoryMovement } from '../../../inventory/movementService.js';
import { buildInventoryMovementDetail } from '../../../inventory/movementHelpers.js';
import { assertSufficientStock, calculateConvertedQuantity } from '../../../inventory/stockHelpers.js';
import { normalizeDecimal } from '../../../../utils/formattersUtils.js';
import {
    adjustSupplierProductStock,
    findSupplierProductByIds
} from '../../products/supplierProductService.js';

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
    const supplierProduct = await findSupplierProductByIds({
        tx,
        productId: currentDetail.productId,
        supplierId
    });
    const previousStock = normalizeDecimal(supplierProduct.currentStock ?? 0);
    const previousConvertedQuantity = normalizeDecimal(supplierProduct.convertedQuantity ?? 0);
    const convertedDifference = calculateConvertedQuantity({
        quantity: normalizedQuantityDifference,
        base: currentDetail.productBase,
        height: currentDetail.productHeight
    });
    const newStock = normalizeDecimal(previousStock + normalizedQuantityDifference);
    const newConvertedQuantity = normalizeDecimal(previousConvertedQuantity + convertedDifference);

    assertSufficientStock({
        product: supplierProduct,
        newStock,
        newConvertedQuantity,
        requestedQuantity: Math.abs(normalizedQuantityDifference)
    });

    const movement = await createInventoryMovement({
        tx,
        movementType: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
        reference: { goodsReceiptId },
        details: [buildInventoryMovementDetail({
            productId: currentDetail.productId,
            supplierId,
            quantity: normalizedQuantityDifference,
            previousStock,
            newStock,
            productBase: currentDetail.productBase,
            productHeight: currentDetail.productHeight,
            goodsReceiptDetailId
        })]
    });

    await adjustSupplierProductStock({
        tx,
        productId: currentDetail.productId,
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
    quantityDifference = normalizeDecimal(resultingDetail.quantity - currentDetail.quantity)
}) => {
    return tx.goodsReceiptDetailChange.create({
        data: {
            goodsReceiptId,
            goodsReceiptDetailId,
            reasonId,
            inventoryMovementId,
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
            quantityDifference,
            costDifference: normalizeDecimal(resultingDetail.costPerUnitType - currentDetail.costPerUnitType)
        },
        include: {
            inventoryMovement: true
        }
    });
};
