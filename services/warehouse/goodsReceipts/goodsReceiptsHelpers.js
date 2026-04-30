import { ProductNotFound } from "../../../errors/warehouse/productError.js";
import { findAllProductDimensions } from "../products/productService.js";

const IVA_RATE = 1.16;

export const roundTo = (value, decimals = 2) => {

    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

export const buildGoodsReceiptDetails = async (tx, details) => {

    const productIds = details.map(d => d.productId);

    const products = await findAllProductDimensions({
        tx,
        productIds
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    return details.map(({ productId, quantity, unitCostByQuantity: costPerUnitType }) => {

        const product = productMap.get(productId);

        if (!product) throw new ProductNotFound();

        const { name, base, height, presentation, unitMeasure } = product;
        const netPurchaseAmount = roundTo(quantity * costPerUnitType);
        const grossPurchaseAmount = roundTo(netPurchaseAmount * IVA_RATE);
        const hasDimensions = base !== null && height !== null && base > 0 && height > 0;
        const convertedQuantity = hasDimensions ? roundTo((base * height) * quantity) : quantity;
        let conversionUnitCost = null;

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