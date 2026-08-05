import { DOCUMENT_REFERENCE_TYPES } from '../../../constants/documentReferenceTypes.js';
import { STOCK_ADJUSTMENT_STATUS_NAMES, STOCK_ADJUSTMENT_TYPES } from '../../../constants/inventory.js';
import { generateYearlyReferenceNumber, throwIfReferenceNumberAlreadyExists } from '../../document/referenceNumberService.js';
import { normalizeDecimal, toNumber } from '../../../utils/formattersUtils.js';
import { assertSufficientStock, calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { createWasteMovement } from './wasteMovementService.js';

const calculateWasteStockAdjustmentValues = ({
    waste,
    newStock,
    previousStock = Number(toNumber(waste.currentStock) || 0),
    previousConvertedQuantity = Number(toNumber(waste.convertedQuantity) || 0)
}) => {
    const adjustedPreviousStock = normalizeDecimal(Number(toNumber(previousStock) || 0));
    const adjustedNewStock = normalizeDecimal(Number(toNumber(newStock) || 0));
    const difference = normalizeDecimal(adjustedNewStock - adjustedPreviousStock);
    const adjustedPreviousConvertedQuantity = normalizeDecimal(Number(toNumber(previousConvertedQuantity) || 0));
    const newConvertedQuantity = normalizeDecimal(calculateConvertedQuantity({
        currentStock: adjustedNewStock,
        base: waste.base,
        height: waste.height,
        fallbackToQuantity: false
    }));
    const convertedDifference = normalizeDecimal(newConvertedQuantity - adjustedPreviousConvertedQuantity);

    assertSufficientStock({
        material: {
            id: waste.id,
            name: waste.supplierMaterial?.material?.name,
            materialId: waste.supplierMaterial?.materialId,
            supplierId: waste.supplierMaterial?.supplierId,
            supplier: waste.supplierMaterial?.supplier,
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

export const registerWasteStockAdjustment = async ({
    tx,
    waste,
    reasonId,
    userId,
    observations,
    newStock,
    previousStock,
    previousConvertedQuantity,
    updateStock = true,
    include = undefined
}) => {
    let referenceNumber = null;

    try {
        const values = calculateWasteStockAdjustmentValues({
            waste,
            newStock,
            previousStock,
            previousConvertedQuantity
        });
        const wasteId = waste.id;
        const adjustmentType = values.difference >= 0
            ? STOCK_ADJUSTMENT_TYPES.INCREASE
            : STOCK_ADJUSTMENT_TYPES.DECREASE;

        referenceNumber = await generateYearlyReferenceNumber({
            type: DOCUMENT_REFERENCE_TYPES.STOCK_ADJUSTMENT,
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
                        materialId: waste.supplierMaterial?.materialId,
                        supplierId: waste.supplierMaterial?.supplierId,
                        materialName: waste.supplierMaterial?.material?.name || '',
                        supplierName: waste.supplierMaterial?.supplier?.tradeName || '',
                        wasteBase: waste.base,
                        wasteHeight: waste.height,
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
            wasteId,
            wasteStockAdjustmentDetailId: adjustmentDetail.id,
            difference: values.difference,
            previousStock: values.previousStock,
            newStock: values.newStock
        });

        await tx.wasteStockAdjustment.update({
            where: { id: adjustment.id },
            data: { movement: { connect: { id: movement.id } } },
            include: { details: true, movement: true }
        });

        if (!updateStock) return waste;

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
