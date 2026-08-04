import { getDb } from '../../repository/baseRepository.js';
import { normalizeDecimal } from '../../utils/formattersUtils.js';
import { createWasteMovement } from './wasteMovementService.js';

export const createWasteStockAdjustment = async ({
    tx = null,
    wasteId,
    reasonId,
    userId,
    observations,
    previousStock,
    newStock,
    previousConvertedQuantity,
    newConvertedQuantity
}) => {

    const db = getDb(tx);

    const difference = normalizeDecimal(newStock - previousStock);
    const adjustment = await db.wasteStockAdjustment.create({
        data: {
            waste: { connect: { id: wasteId } },
            reason: { connect: { id: reasonId } },
            createdBy: { connect: { id: userId } },
            observations,
            previousStock,
            newStock,
            difference,
            previousConvertedQuantity,
            newConvertedQuantity,
            convertedDifference: normalizeDecimal(newConvertedQuantity - previousConvertedQuantity)
        }
    });

    await createWasteMovement({
        tx,
        wasteId,
        wasteStockAdjustmentId: adjustment.id,
        difference,
        previousStock,
        newStock
    });

    return adjustment;
};
