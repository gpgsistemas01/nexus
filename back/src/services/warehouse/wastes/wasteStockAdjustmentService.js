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
    reserveYearlyReferenceNumbers,
    throwIfReferenceNumberAlreadyExists
} from '../../document/referenceNumberService.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { assertPieceQuantity, assertSufficientStock, calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { createWasteMovement } from './wasteMovementService.js';

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

export const registerWasteStockAdjustmentsBatch = async ({ tx, entries, userId }) => {
    if (!entries.length) return [];
    const references = await reserveYearlyReferenceNumbers({ type: DOCUMENT_REFERENCE_TYPES.WASTE_STOCK_ADJUSTMENT, tx, count: entries.length });
    const adjustments = [], details = [], movements = [], movementDetails = [], changes = [];
    const now = new Date();
    entries.forEach((entry, index) => {
        const values = calculateWasteStockAdjustmentValues(entry);
        const id = randomUUID(), detailId = randomUUID(), movementId = randomUUID();
        movements.push({ id: movementId, type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT });
        adjustments.push({ id, referenceNumber: references[index], reasonId: entry.reasonId, observations: entry.observations,
            type: values.difference >= 0 ? STOCK_ADJUSTMENT_TYPES.INCREASE : STOCK_ADJUSTMENT_TYPES.DECREASE,
            status: STOCK_ADJUSTMENT_STATUS_NAMES.APPLIED, appliedAt: now, createdById: userId, approvedById: userId, wasteMovementId: movementId });
        details.push({ id: detailId, wasteStockAdjustmentId: id, wasteId: entry.waste.id, materialName: entry.waste.name, ...values });
        movementDetails.push({ movementId, wasteId: entry.waste.id, wasteStockAdjustmentDetailId: detailId,
            quantity: values.difference, previousStock: values.previousStock, newStock: values.newStock });
        changes.push({ id: entry.waste.id, quantityChange: values.difference, convertedQuantityChange: values.convertedDifference });
    });
    await tx.wasteMovement.createMany({ data: movements });
    await tx.wasteStockAdjustment.createMany({ data: adjustments });
    await tx.wasteStockAdjustmentDetail.createMany({ data: details });
    await tx.wasteMovementDetail.createMany({ data: movementDetails });
    const balances = await updateWasteStocks({ tx, changes });
    if (balances.length !== entries.length) throw new RecordVersionConflictError();
    return references;
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
