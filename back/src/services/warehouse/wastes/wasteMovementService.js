import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import { getDb } from '../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { applyWasteStockChanges } from './wasteInventoryService.js';

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

    const balances = await applyWasteStockChanges({ tx, changes: [...grouped.values()] });
    const movementDetails = details.map(detail => {
        const quantity = isIssue ? -detail.quantity : detail.quantity;
        const balance = balances.get(detail.wasteId);
        const previousStock = balance.previousStock;
        const newStock = normalizeDecimal(previousStock + quantity);
        balance.previousStock = newStock;

        return {
            wasteId: detail.wasteId,
            ...(detail.wasteIssueDetailId && { wasteIssueDetailId: detail.wasteIssueDetailId }),
            quantity,
            previousStock,
            newStock
        };
    });

    return createWasteMovement({
        tx,
        reference,
        details: movementDetails,
        movementType
    });
};
