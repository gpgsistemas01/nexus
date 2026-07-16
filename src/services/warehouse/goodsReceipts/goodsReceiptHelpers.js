import { ProductNotFound } from "../../../errors/warehouse/productError.js";
import { roundTo } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { findProductsSnapshot } from "../products/productService.js";

const IVA_RATE = 1.16;

export const buildGoodsReceiptDetails = async (details, { tx = null } = {}) => {

    const productIds = details.map(d => d.productId);

    const products = await findProductsSnapshot({ tx, productIds });

    const productMap = new Map(products.map(p => [p.id, p]));

    return details.map(({ productId, quantity, costPerUnitType }) => {

        const product = productMap.get(productId);

        if (!product) throw new ProductNotFound();

        const { name, base, height, presentation, unitMeasure } = product;
        const netPurchaseAmount = roundTo(quantity * costPerUnitType);
        const grossPurchaseAmount = roundTo(netPurchaseAmount * IVA_RATE);
        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base,
            height
        });
        let conversionUnitCost = 0;

        if (convertedQuantity) conversionUnitCost = convertedQuantity > 0 ? roundTo(netPurchaseAmount / convertedQuantity) : 0;

        return {
            productId,
            quantity,
            convertedQuantity,
            costPerUnitType,
            conversionUnitCost,
            netPurchaseAmount,
            grossPurchaseAmount,
            productName: name,
            productBase: base,
            productHeight: height,
            presentationId: presentation.id,
            presentationName: presentation.name,
            unitMeasureId: unitMeasure.id,
            unitMeasureName: unitMeasure.name,
            unitMeasureSymbol: unitMeasure.symbol
        };
    });
}

// Keep totals calculation side-effect free so create/update flows can reuse the same arithmetic.
export const calculateGoodsReceiptTotals = (details = []) => details.reduce((acc, detail) => {
    acc.totalQuantity += Number(detail.quantity || 0);
    acc.totalNetPurchaseAmount += Number(detail.netPurchaseAmount || 0);
    acc.totalGrossPurchaseAmount += Number(detail.grossPurchaseAmount || 0);

    return acc;
}, {
    totalQuantity: 0,
    totalNetPurchaseAmount: 0,
    totalGrossPurchaseAmount: 0
});

// Keep persistence separate from the pure totals calculation because corrections must update one detail,
// reload all receipt details, and then persist recalculated receipt totals in the same transaction.
export const updateGoodsReceiptDetailAndTotals = async ({ tx, goodsReceiptId, detailId, correctedDetail }) => {
    const updatedDetail = await tx.goodsReceiptDetail.update({
        where: { id: detailId },
        data: correctedDetail
    });

    const receiptDetails = await tx.goodsReceiptDetail.findMany({
        where: { goodsReceiptId },
        select: {
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });
    const totals = calculateGoodsReceiptTotals(receiptDetails);

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: totals,
        include: {
            details: true
        }
    });

    return {
        updatedDetail,
        updatedReceipt
    };
};

export const createGoodsReceiptDetailsAndUpdateTotals = async ({ tx, goodsReceiptId, details }) => {
    const processedDetails = await buildGoodsReceiptDetails(details, { tx });
    const createdDetails = await tx.goodsReceiptDetail.createManyAndReturn({
        data: processedDetails.map(detail => ({
            ...detail,
            goodsReceiptId
        }))
    });

    const receiptDetails = await tx.goodsReceiptDetail.findMany({
        where: { goodsReceiptId },
        select: {
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: calculateGoodsReceiptTotals(receiptDetails),
        include: {
            details: true,
            status: true
        }
    });

    return {
        createdDetails,
        updatedReceipt
    };
};
