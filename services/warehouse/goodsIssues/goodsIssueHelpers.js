import { ProductNotFound } from "../../../errors/warehouse/productError.js";
import { buildStockKey, roundTo } from "../../../utils/formattersUtils.js";
import { findSupplierProductsSnapshot } from "../products/supplierProductService.js";

const FLOAT_EPSILON = 0.000001;
const FULFILLMENT_PENDING = 'Pendiente';
const FULFILLMENT_PARTIAL = 'Surtido parcial';
const FULFILLMENT_COMPLETE = 'Surtido';

export const buildGoodsIssueDetails = async ({
    details
}) => {

    const pairs = [
        ...new Map(
            details.map(detail => [
                buildStockKey(detail.productId, detail.supplierId),
                {
                    productId: detail.productId,
                    supplierId: detail.supplierId
                }
            ])
        ).values()
    ];

    const supplierProducts = await findSupplierProductsSnapshot({ pairs });

    const spMap = new Map(
        supplierProducts.map(sp => [
            buildStockKey(sp.id, sp.supplier.id),
            sp
        ])
    );

    return details.map(({ productId, quantity, supplierId }) => {

        const key = buildStockKey(productId, supplierId);
        const sp = spMap.get(key);

        if (!sp) throw new ProductNotFound();

        const { name, base, height, presentation, unitMeasure, maxUnitCost } = sp;
        const hasDimensions = base !== null && height !== null && base > 0 && height > 0;
        const convertedQuantity = hasDimensions ? roundTo((base * height) * quantity) : quantity;

        return {
            productId,
            supplierId,
            supplierName: sp.supplier.tradeName,
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

export const buildGoodsIssueDetailUpdate = ({ current, detail, currentStock }) => {

    const difference = current.convertedQuantity - detail.projectConvertedQuantity;

    if (current.fulfillmentStatus?.name === FULFILLMENT_COMPLETE) {

        return {
            updateData: {
                projectConvertedQuantity: detail.projectConvertedQuantity,
                convertedQuantityDifference: current.convertedQuantity - detail.projectConvertedQuantity,
                isSupplied: true
            },
            fulfillmentName: FULFILLMENT_COMPLETE,
            movement: null,
            remainingStock: currentStock
        }
    }

    if (!detail.isSupplied) {

        return {
            updateData: {
                projectConvertedQuantity: detail.projectConvertedQuantity,
                convertedQuantityDifference: difference,
                isSupplied: false
            },
            fulfillmentName: current.fulfillmentStatus?.name ?? FULFILLMENT_PENDING,
            movement: null,
            remainingStock: currentStock
        };
    }

    const pendingBase = Math.max(0, current.quantity - current.suppliedQuantity);
    const suppliedPartialBase = Math.min(pendingBase, currentStock);
    const suppliedBase = Number(current.suppliedQuantity) + suppliedPartialBase;
    const isFullySupplied = suppliedBase + FLOAT_EPSILON >= current.quantity;
    const isSupplied = suppliedBase > FLOAT_EPSILON;

    const fulfillmentName = isFullySupplied
        ? FULFILLMENT_COMPLETE
        : (isSupplied ? FULFILLMENT_PARTIAL : FULFILLMENT_PENDING);

    return {
        updateData: {
            projectConvertedQuantity: detail.projectConvertedQuantity,
            suppliedQuantity: suppliedBase,
            convertedQuantityDifference: difference,
            isSupplied
        },
        fulfillmentName,
        movement: suppliedPartialBase > FLOAT_EPSILON
            ? {
                productId: current.productId,
                goodsIssueDetailId: current.id,
                supplierId: current.supplierId,
                quantity: suppliedPartialBase
            }
            : null,
        remainingStock: currentStock - suppliedPartialBase
    };
};

export const resolveFulfillmentStatus = (details) => {

    const allSupplied = details.every((d) => d.isSupplied);

    const anySupplied = details.some(
        (d) => (d.suppliedQuantity ?? 0) > FLOAT_EPSILON
    );

    return allSupplied
        ? FULFILLMENT_COMPLETE
        : (anySupplied ? FULFILLMENT_PARTIAL : FULFILLMENT_PENDING);
};