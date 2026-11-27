import { buildStockKey } from '../../utils/formattersUtils.js';
import { normalizeDecimal } from '../../shared/utils/numberUtils.js';
import { MovementDetailRelationConflict } from "../../errors/inventory/movementError.js";

const resolveValue = (item, resolver) => (
    typeof resolver === 'function'
        ? resolver(item)
        : item[resolver]
);

export const buildMovementCostRelations = ({ cost, returnAllocations = [] }) => ({
    ...(cost && { cost: { create: cost } }),
    ...(returnAllocations.length > 0 && { returnAllocations: { create: returnAllocations } })
});

export const buildInventoryMovementDetail = ({
    materialId,
    supplierId,
    quantity,
    previousStock,
    newStock,
    goodsReceiptDetailId = null,
    goodsIssueDetailId = null,
    stockAdjustmentDetailId = null,
    cost,
    returnAllocations
}) => ({
    materialId,
    supplierId,
    quantity,
    previousStock,
    newStock,
    ...(goodsReceiptDetailId && { goodsReceiptDetailId }),
    ...(goodsIssueDetailId && { goodsIssueDetailId }),
    ...(stockAdjustmentDetailId && { stockAdjustmentDetailId }),
    ...buildMovementCostRelations({ cost, returnAllocations })
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
