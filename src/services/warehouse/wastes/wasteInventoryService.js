import { getDb } from '../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';

export const applyWasteStockChange = async ({
    tx,
    id,
    quantityChange,
    convertedQuantityChange
}) => {
    const db = getDb(tx);
    const waste = await db.waste.findUnique({
        where: { id },
        select: { currentStock: true }
    });
    const previousStock = normalizeDecimal(waste?.currentStock || 0);
    const isDecrease = quantityChange < 0;
    const quantity = normalizeDecimal(Math.abs(quantityChange));
    const convertedQuantity = normalizeDecimal(Math.abs(convertedQuantityChange));
    const updated = await db.waste.updateMany({
        where: {
            id,
            ...(isDecrease && { currentStock: { gte: quantity } })
        },
        data: {
            currentStock: isDecrease
                ? { decrement: quantity }
                : { increment: quantity },
            convertedQuantity: isDecrease
                ? { decrement: convertedQuantity }
                : { increment: convertedQuantity }
        }
    });

    return {
        updated: updated.count === 1,
        previousStock,
        newStock: normalizeDecimal(previousStock + quantityChange)
    };
};
