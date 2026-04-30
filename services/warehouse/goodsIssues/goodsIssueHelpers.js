import { ProductNotFound } from "../../../errors/warehouse/productError.js";
import { roundTo } from "../../../utils/formattersUtils.js";
import { findSupplierProductsSnapshot } from "../products/supplierProductService.js";

export const buildGoodsIssueDetails = async ({
    details
}) => {

    const pairs = [
        ...new Map(
            details.map(d => [
                `${d.productId}-${d.supplierId}`,
                {
                    productId: d.productId,
                    supplierId: d.supplierId
                }
            ])
        ).values()
    ];

    const products = await findSupplierProductsSnapshot({ pairs });

    const productMap = new Map(
        products.map(p => [
            `${p.id}-${p.supplier.id}`,
            p
        ])
    );

    return details.map(({ productId, quantity, supplierId }) => {

        const key = `${productId}-${supplierId}`;
        const product = productMap.get(key);

        if (!product) throw new ProductNotFound();

        const { name, base, height, presentation, unitMeasure, maxUnitCost } = product;
        const hasDimensions = base !== null && height !== null && base > 0 && height > 0;
        const convertedQuantity = hasDimensions ? roundTo((base * height) * quantity) : quantity;

        return {
            productId,
            supplierId,
            supplierName: product.supplier.tradeName,
            quantity,
            convertedQuantity,
            maxUnitCost,
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