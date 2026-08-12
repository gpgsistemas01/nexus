import { getDb } from '../../../repository/baseRepository.js';

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
    const previousStock = Number(waste?.currentStock || 0);
    const isDecrease = quantityChange < 0;
    const quantity = Math.abs(quantityChange);
    const convertedQuantity = Math.abs(convertedQuantityChange);
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
        newStock: previousStock + quantityChange
    };
};
