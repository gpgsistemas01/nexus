import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import { getDb } from '../../../repository/baseRepository.js';
import { WasteIssueStockConflict } from '../../../errors/warehouse/wasteIssueError.js';
import { applyWasteStockChange } from './wasteInventoryService.js';

export const createWasteMovement = async ({
    tx = null,
    wasteId,
    wasteStockAdjustmentDetailId = null,
    difference,
    previousStock,
    newStock
}) => {

    const db = getDb(tx);

    return db.wasteMovement.create({
        data: {
            type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
            details: { create: {
                waste: { connect: { id: wasteId } },
                ...(wasteStockAdjustmentDetailId && {
                    wasteStockAdjustmentDetail: { connect: { id: wasteStockAdjustmentDetailId } }
                }),
                quantity: difference,
                previousStock,
                newStock
            } }
        },
        include: { details: true }
    });
};

export const applyWasteIssueMovement = async ({
    tx,
    wasteIssueId,
    details
}) => {

    const movementDetails = [];

    for (const detail of details) {
        const convertedQuantity = detail.convertedQuantity;
        const stockChange = await applyWasteStockChange({
            tx,
            id: detail.wasteId,
            quantityChange: -detail.quantity,
            convertedQuantityChange: -convertedQuantity
        });

        if (!stockChange.updated) {
            throw new WasteIssueStockConflict({
                materialName: detail.materialName
            });
        }

        movementDetails.push({
            wasteId: detail.wasteId,
            wasteIssueDetailId: detail.wasteIssueDetailId,
            quantity: -detail.quantity,
            previousStock: stockChange.previousStock,
            newStock: stockChange.newStock
        });
    }

    if (!movementDetails.length) return null;

    return tx.wasteMovement.create({
        data: {
            type: INVENTORY_MOVEMENT_TYPES.ISSUE,
            wasteIssueId,
            details: { create: movementDetails }
        },
        include: { details: true }
    });
};

export const applyWasteIssueReturnMovement = async ({
    tx,
    wasteIssueId,
    detail
}) => {

    const stockChange = await applyWasteStockChange({
        tx,
        id: detail.wasteId,
        quantityChange: detail.quantity,
        convertedQuantityChange: detail.convertedQuantity
    });

    return tx.wasteMovement.create({
        data: {
            type: INVENTORY_MOVEMENT_TYPES.ENTRY,
            wasteIssueId,
            details: {
                create: {
                    wasteId: detail.wasteId,
                    wasteIssueDetailId: detail.wasteIssueDetailId,
                    quantity: detail.quantity,
                    previousStock: stockChange.previousStock,
                    newStock: stockChange.newStock
                }
            }
        },
        include: { details: true }
    });
};
