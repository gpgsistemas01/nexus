import { INVENTORY_MOVEMENT_TYPES } from '../../constants/inventory.js';
import { getDb } from '../../repository/baseRepository.js';

export const createWasteMovement = async ({
    tx = null,
    wasteId,
    wasteStockAdjustmentId,
    difference,
    previousStock,
    newStock
}) => {

    if (difference === 0) return null;

    const db = getDb(tx);

    return db.wasteMovement.create({
        data: {
            wasteStockAdjustment: { connect: { id: wasteStockAdjustmentId } },
            type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
            details: { create: {
                waste: { connect: { id: wasteId } },
                wasteStockAdjustment: { connect: { id: wasteStockAdjustmentId } },
                quantity: difference,
                previousStock,
                newStock
            } }
        },
        include: { details: true }
    });
};
