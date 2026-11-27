import { randomUUID } from 'node:crypto';
import { DOCUMENT_REFERENCE_TYPES } from '../../../constants/documentReferenceTypes.js';
import { updateWasteStocks } from '../../../repository/warehouse/stockUpdateRepository.js';
import { RecordVersionConflictError } from '../../../errors/concurrencyError.js';
import {
    STOCK_ADJUSTMENT_STATUS_NAMES,
    STOCK_ADJUSTMENT_TYPES,
    INVENTORY_MOVEMENT_TYPES
} from '../../../constants/inventory.js';
import {
    generateYearlyReferenceNumber,
    throwIfReferenceNumberAlreadyExists
} from '../../document/referenceNumberService.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { calculateConvertedQuantity } from '../../../shared/inventory/stockQuantity.js';
import { assertPieceQuantity, assertSufficientStock } from '../../inventory/stockHelpers.js';
import { createWasteMovement } from './wasteMovementService.js';
import { buildAppliedAdjustmentHeader } from '../stockAdjustmentDocument.js';

export const calculateWasteStockAdjustmentValues = ({
    waste,
    newStock
}) => {
    assertPieceQuantity({ quantity: newStock, item: waste });
    const adjustedPreviousStock = normalizeDecimal(toNumber(waste.currentStock) || 0);
    const adjustedNewStock = normalizeDecimal(toNumber(newStock) || 0);
    const difference = normalizeDecimal(adjustedNewStock - adjustedPreviousStock);
    const adjustedPreviousConvertedQuantity = normalizeDecimal(toNumber(waste.convertedQuantity) || 0);
    const newConvertedQuantity = normalizeDecimal(calculateConvertedQuantity({
        currentStock: adjustedNewStock,
        base: waste.base,
        height: waste.height
    }));
    const convertedDifference = normalizeDecimal(newConvertedQuantity - adjustedPreviousConvertedQuantity);

    assertSufficientStock({
        material: {
            id: waste.id,
            name: waste.name,
            supplierId: waste.supplierId,
            supplier: waste.supplier,
            base: waste.base,
            height: waste.height
        },
        newStock: adjustedNewStock,
        newConvertedQuantity,
        requestedQuantity: Math.abs(difference)
    });

    return {
        previousStock: adjustedPreviousStock,
        newStock: adjustedNewStock,
        difference,
        previousConvertedQuantity: adjustedPreviousConvertedQuantity,
        newConvertedQuantity,
        convertedDifference
    };
};

export const registerWasteStockAdjustmentDocument = async ({ tx, entries, userId, inventoryImportId }) => {
    const referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.WASTE_STOCK_ADJUSTMENT, tx });
    const id = randomUUID();
    const movementId = randomUUID();
    const movementDetails = [];
    const changes = [];
    const details = entries.map(entry => {
        const values = calculateWasteStockAdjustmentValues(entry);
        const detailId = randomUUID();
        const { waste, reasonId, observations } = entry;
        movementDetails.push({ movementId, wasteId: waste.id, wasteStockAdjustmentDetailId: detailId,
            quantity: values.difference, previousStock: values.previousStock, newStock: values.newStock });
        changes.push({ id: waste.id, quantityChange: values.difference, convertedQuantityChange: values.convertedDifference });
        return { id: detailId, wasteStockAdjustmentId: id, wasteId: waste.id, materialName: waste.name,
            reasonId, observations, ...values };
    });
    await tx.wasteMovement.create({ data: { id: movementId, type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT } });
    await tx.wasteStockAdjustment.create({ data: {
        id, referenceNumber, wasteMovementId: movementId, inventoryImportId,
        ...buildAppliedAdjustmentHeader({ details, userId, appliedAt: new Date() })
    } });
    await tx.wasteStockAdjustmentDetail.createMany({ data: details });
    await tx.wasteMovementDetail.createMany({ data: movementDetails });
    const balances = await updateWasteStocks({ tx, changes });
    if (balances.length !== entries.length) throw new RecordVersionConflictError();
    return { id, referenceNumber };
};

export const registerWasteStockAdjustment = async ({
    tx,
    waste,
    reasonId,
    userId,
    observations,
    newStock,
    include = undefined
}) => {
    let referenceNumber = null;

    try {
        const values = calculateWasteStockAdjustmentValues({
            waste,
            newStock
        });
        const wasteId = waste.id;
        const adjustmentType = values.difference >= 0
            ? STOCK_ADJUSTMENT_TYPES.INCREASE
            : STOCK_ADJUSTMENT_TYPES.DECREASE;

        referenceNumber = await generateYearlyReferenceNumber({
            type: DOCUMENT_REFERENCE_TYPES.WASTE_STOCK_ADJUSTMENT,
            tx
        });

        const adjustment = await tx.wasteStockAdjustment.create({
            data: {
                referenceNumber,
                type: adjustmentType,
                status: STOCK_ADJUSTMENT_STATUS_NAMES.APPLIED,
                appliedAt: new Date(),
                reason: { connect: { id: reasonId } },
                createdBy: { connect: { id: userId } },
                approvedBy: { connect: { id: userId } },
                observations,
                details: {
                    create: {
                        waste: { connect: { id: wasteId } },
                        reason: { connect: { id: reasonId } },
                        observations,
                        materialName: waste.name,
                        previousStock: values.previousStock,
                        newStock: values.newStock,
                        difference: values.difference,
                        previousConvertedQuantity: values.previousConvertedQuantity,
                        newConvertedQuantity: values.newConvertedQuantity,
                        convertedDifference: values.convertedDifference
                    }
                }
            },
            include: { details: true }
        });

        const [adjustmentDetail] = adjustment.details;

        const movement = await createWasteMovement({
            tx,
            movementType: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
            details: [{
                wasteId,
                wasteStockAdjustmentDetailId: adjustmentDetail.id,
                quantity: values.difference,
                previousStock: values.previousStock,
                newStock: values.newStock
            }]
        });

        await tx.wasteStockAdjustment.update({
            where: { id: adjustment.id },
            data: { movement: { connect: { id: movement.id } } },
            include: { details: true, movement: true }
        });

        return tx.waste.update({
            where: { id: wasteId },
            data: {
                currentStock: values.newStock,
                convertedQuantity: values.newConvertedQuantity
            },
            include
        });
    } catch (err) {

        throwIfReferenceNumberAlreadyExists({ err, referenceNumber });
        
        throw err;
    }
};
