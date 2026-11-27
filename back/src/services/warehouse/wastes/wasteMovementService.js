import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import { getDb } from '../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { applyWasteStockChanges } from './wasteInventoryService.js';
import { WasteIssueMissingMaxUnitCost } from '../../../errors/warehouse/wasteIssueError.js';
import { buildMovementCostRelations } from '../../inventory/movementHelpers.js';

export const createWasteMovement = ({
    tx = null,
    reference = {},
    details,
    movementType
}) => {
    const db = getDb(tx);

    return db.wasteMovement.create({
        data: {
            ...reference,
            type: movementType,
            details: { create: details }
        },
        include: { details: true }
    });
};

export const applyWasteMovement = async ({
    tx,
    reference = {},
    details,
    movementType
}) => {
    if (!details.length) return null;

    const isIssue = movementType === INVENTORY_MOVEMENT_TYPES.ISSUE;
    const grouped = new Map();
    for (const detail of details) {
        const signedQuantity = isIssue ? -detail.quantity : detail.quantity;
        const signedConvertedQuantity = isIssue
            ? -detail.convertedQuantity
            : detail.convertedQuantity;
        const change = grouped.get(detail.wasteId) ?? {
            id: detail.wasteId,
            materialName: detail.materialName,
            quantityChange: 0,
            convertedQuantityChange: 0
        };
        change.quantityChange = normalizeDecimal(change.quantityChange + signedQuantity);
        change.convertedQuantityChange = normalizeDecimal(change.convertedQuantityChange + signedConvertedQuantity);
        grouped.set(detail.wasteId, change);
    }

    const balances = await applyWasteStockChanges({
        tx,
        changes: [...grouped.values()],
        includeMaxUnitCost: isIssue && details.some(detail => detail.wasteIssueDetailId)
    });
    const movementDetails = details.map(detail => {
        const quantity = isIssue ? -detail.quantity : detail.quantity;
        const balance = balances.get(detail.wasteId);
        const previousStock = balance.previousStock;
        const newStock = normalizeDecimal(previousStock + quantity);
        balance.previousStock = newStock;

        if (isIssue && detail.wasteIssueDetailId && !(Number(balance.maxUnitCost) > 0)) {
            throw new WasteIssueMissingMaxUnitCost({ materialName: detail.materialName });
        }
        const cost = isIssue && detail.wasteIssueDetailId ? { unitCost: balance.maxUnitCost } : detail.cost;
        return {
            wasteId: detail.wasteId,
            ...(detail.wasteIssueDetailId && { wasteIssueDetailId: detail.wasteIssueDetailId }),
            quantity,
            previousStock,
            newStock,
            ...buildMovementCostRelations({ cost, returnAllocations: detail.returnAllocations })
        };
    });

    return createWasteMovement({
        tx,
        reference,
        details: movementDetails,
        movementType
    });
};
