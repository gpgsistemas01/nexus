import { randomUUID } from 'node:crypto';
import { DOCUMENT_REFERENCE_TYPES } from '../../../constants/documentReferenceTypes.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import {
    generateYearlyReferenceNumber,
    reserveYearlyReferenceNumbers,
    throwIfReferenceNumberAlreadyExists
} from '../../document/referenceNumberService.js';
import { assertPieceQuantity, calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { applyWasteMovement } from './wasteMovementService.js';
import { applyWasteStockChanges } from './wasteInventoryService.js';

export const registerWasteStockEntry = async ({
    tx,
    waste,
    quantity,
    observations,
    userId
}) => {
    let referenceNumber = null;

    try {
        assertPieceQuantity({ quantity, item: waste });
        referenceNumber = await generateYearlyReferenceNumber({
            type: DOCUMENT_REFERENCE_TYPES.WASTE_STOCK_ENTRY,
            tx
        });
        const movement = await applyWasteMovement({
            tx,
            movementType: INVENTORY_MOVEMENT_TYPES.ENTRY,
            details: [{
                wasteId: waste.id,
                quantity,
                convertedQuantity: calculateConvertedQuantity({
                    currentStock: quantity,
                    base: waste.base,
                    height: waste.height
                })
            }]
        });
        const movementDetail = movement.details.find(detail => detail.wasteId === waste.id);

        return tx.wasteStockEntry.create({
            data: {
                referenceNumber,
                waste: { connect: { id: waste.id } },
                createdBy: { connect: { id: userId } },
                movement: { connect: { id: movement.id } },
                materialName: waste.name,
                quantity,
                previousStock: movementDetail.previousStock,
                newStock: movementDetail.newStock,
                observations
            }
        });
    } catch (err) {
        throwIfReferenceNumberAlreadyExists({ err, referenceNumber });
        throw err;
    }
};

export const registerWasteStockEntriesBatch = async ({ tx, entries, userId }) => {
    if (!entries.length) return [];
    for (const entry of entries) assertPieceQuantity({ quantity: entry.quantity, item: entry.waste });
    const references = await reserveYearlyReferenceNumbers({ type: DOCUMENT_REFERENCE_TYPES.WASTE_STOCK_ENTRY, tx, count: entries.length });
    const balances = await applyWasteStockChanges({ tx, changes: entries.map(entry => ({
        id: entry.waste.id, materialName: entry.waste.name, quantityChange: entry.quantity,
        convertedQuantityChange: calculateConvertedQuantity({ currentStock: entry.quantity, base: entry.waste.base, height: entry.waste.height })
    })) });
    const movements = entries.map(() => ({ id: randomUUID(), type: INVENTORY_MOVEMENT_TYPES.ENTRY }));
    await tx.wasteMovement.createMany({ data: movements });
    await tx.wasteMovementDetail.createMany({ data: entries.map((entry, index) => ({
        movementId: movements[index].id, wasteId: entry.waste.id, quantity: entry.quantity,
        ...balances.get(entry.waste.id)
    })) });
    await tx.wasteStockEntry.createMany({ data: entries.map((entry, index) => ({
        referenceNumber: references[index], wasteId: entry.waste.id, createdById: userId,
        wasteMovementId: movements[index].id, materialName: entry.waste.name,
        quantity: entry.quantity, observations: entry.observations, ...balances.get(entry.waste.id)
    })) });
    return references;
};
