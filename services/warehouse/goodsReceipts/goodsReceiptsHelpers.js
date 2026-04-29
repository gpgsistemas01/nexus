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

    return details.map(({ productId, quantity, unitCostByQuantity }) => {

        const product = productMap.get(productId);

        if (!product) throw new ProductNotFound();

        const netPurchaseAmount = roundTo(quantity * unitCostByQuantity);
        const grossPurchaseAmount = roundTo(netPurchaseAmount * IVA_RATE);
        const { base, height } = product;
        const hasDimensions = base !== null && height !== null && base > 0 && height > 0;
        const totalArea = hasDimensions ? roundTo((base * height) * quantity) : quantity;
        let unitCostByArea = null;

        if (totalArea) unitCostByArea = totalArea > 0 ? roundTo(netPurchaseAmount / totalArea) : 0;

        return {
            productId,
            quantity,
            totalArea,
            unitCostByQuantity,
            unitCostByArea,
            netPurchaseAmount,
            grossPurchaseAmount
        };
    });
}