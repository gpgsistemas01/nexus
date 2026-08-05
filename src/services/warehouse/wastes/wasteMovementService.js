import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import { getDb } from '../../../repository/baseRepository.js';

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
