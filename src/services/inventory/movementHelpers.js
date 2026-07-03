import { buildStockKey, normalizeDecimal } from "../../utils/formattersUtils.js";

const resolveValue = (item, resolver) => (
    typeof resolver === 'function'
        ? resolver(item)
        : item[resolver]
);

export const buildStockUpdateSummary = ({
    details,
    productId = 'productId',
    supplierId = 'supplierId',
    quantity = 'quantity'
}) => {

    const stockKeys = new Set();
    const grouped = new Map();

    for (const detail of details) {

        const key = buildStockKey(
            resolveValue(detail, productId),
            resolveValue(detail, supplierId)
        );

        stockKeys.add(key);

        grouped.set(
            key,
            normalizeDecimal(
                normalizeDecimal(grouped.get(key) || 0) + normalizeDecimal(resolveValue(detail, quantity))
            )
        );
    }

    return {
        stockKeys,
        grouped
    };
};
