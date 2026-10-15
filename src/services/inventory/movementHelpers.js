import { buildStockKey, normalizeDecimal } from "../../utils/formattersUtils.js";
import { MovementDetailRelationConflict } from "../../errors/inventory/movementError.js";

const resolveValue = (item, resolver) => (
    typeof resolver === 'function'
        ? resolver(item)
        : item[resolver]
);

export const buildInventoryMovementDetail = ({
    materialId,
    supplierId,
    quantity,
    previousStock,
    newStock,
    goodsReceiptDetailId = null,
    goodsIssueDetailId = null,
    stockAdjustmentDetailId = null
}) => ({
    materialId,
    supplierId,
    quantity,
    previousStock,
    newStock,
    ...(goodsReceiptDetailId && { goodsReceiptDetailId }),
    ...(goodsIssueDetailId && { goodsIssueDetailId }),
    ...(stockAdjustmentDetailId && { stockAdjustmentDetailId })
});

export const buildStockUpdateSummary = ({
    details,
    materialId = 'materialId',
    supplierId = 'supplierId',
    quantity = 'quantity'
}) => {

    const grouped = new Map();

    for (const detail of details) {

        const resolvedMaterialId = resolveValue(detail, materialId);
        const resolvedSupplierId = resolveValue(detail, supplierId);
        if (!resolvedMaterialId || !resolvedSupplierId) throw new MovementDetailRelationConflict();

        const key = buildStockKey(resolvedMaterialId, resolvedSupplierId);

        grouped.set(
            key,
            normalizeDecimal(
                normalizeDecimal(grouped.get(key) || 0) + normalizeDecimal(resolveValue(detail, quantity))
            )
        );
    }

    return {
        grouped
    };
};
