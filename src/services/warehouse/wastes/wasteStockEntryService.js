import { DOCUMENT_REFERENCE_TYPES } from '../../../constants/documentReferenceTypes.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import {
    generateYearlyReferenceNumber,
    throwIfReferenceNumberAlreadyExists
} from '../../document/referenceNumberService.js';
import { calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { applyWasteMovement } from './wasteMovementService.js';

export const registerWasteStockEntry = async ({
    tx,
    waste,
    quantity,
    observations,
    userId
}) => {
    let referenceNumber = null;

    try {
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
            },
            include: { movement: { include: { details: true } } }
        });
    } catch (err) {
        throwIfReferenceNumberAlreadyExists({ err, referenceNumber });
        throw err;
    }
};
