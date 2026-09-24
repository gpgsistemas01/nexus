import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import { getDb } from '../../../repository/baseRepository.js';
import { WasteIssueStockConflict } from '../../../errors/warehouse/wasteIssueError.js';
import { applyWasteStockChange } from './wasteInventoryService.js';

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
    const movementDetails = [];
    const isIssue = movementType === INVENTORY_MOVEMENT_TYPES.ISSUE;

    for (const detail of details) {
        const signedQuantity = isIssue ? -detail.quantity : detail.quantity;
        const signedConvertedQuantity = isIssue
            ? -detail.convertedQuantity
            : detail.convertedQuantity;
        const stockChange = await applyWasteStockChange({
            tx,
            id: detail.wasteId,
            quantityChange: signedQuantity,
            convertedQuantityChange: signedConvertedQuantity
        });

        if (!stockChange.updated) {
            throw new WasteIssueStockConflict({ materialName: detail.materialName });
        }

        movementDetails.push({
            wasteId: detail.wasteId,
            ...(detail.wasteIssueDetailId && { wasteIssueDetailId: detail.wasteIssueDetailId }),
            quantity: signedQuantity,
            previousStock: stockChange.previousStock,
            newStock: stockChange.newStock
        });
    }

    if (!movementDetails.length) return null;

    return createWasteMovement({
        tx,
        reference,
        details: movementDetails,
        movementType
    });
};
