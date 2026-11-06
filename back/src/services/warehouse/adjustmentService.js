import { randomUUID } from 'node:crypto';
import { getDb } from "../../repository/baseRepository.js";
import {
    generateYearlyReferenceNumber,
    reserveYearlyReferenceNumbers,
    throwIfReferenceNumberAlreadyExists
} from "../document/referenceNumberService.js";
import { toNumber } from '../../utils/formattersUtils.js';
import { normalizeDecimal } from '../../shared/utils/numberUtils.js';
import { assertPieceQuantity, assertSufficientStock, calculateConvertedQuantity } from "../inventory/stockHelpers.js";
import { findSupplierMaterialByIds } from "./materials/supplierMaterialService.js";
import { adjustSupplierMaterialStock } from "./materials/supplierMaterialStockService.js";
import { lockSupplierMaterialStock } from "../../repository/warehouse/stockLockRepository.js";
import {
    INVENTORY_MOVEMENT_TYPES,
    STOCK_ADJUSTMENT_STATUS_NAMES,
    STOCK_ADJUSTMENT_TYPES
} from '../../constants/inventory.js';
import { DOCUMENT_REFERENCE_TYPES } from "../../constants/documentReferenceTypes.js";
import { createInventoryMovement } from "../inventory/movementService.js";
import { buildInventoryMovementDetail } from "../inventory/movementHelpers.js";

import { assertRecordVersion } from '../../repository/versionRepository.js';
import { updateSupplierMaterialStocks } from '../../repository/warehouse/stockUpdateRepository.js';
import { RecordVersionConflictError } from '../../errors/concurrencyError.js';

const createStockAdjustmentMovement = async ({
    tx,
    adjustment,
    materialId,
    supplierId,
    goodsIssueId,
    goodsIssueDetailId,
    goodsReceiptId,
    goodsReceiptDetailId,
    previousStock,
    newStock,
    difference
}) => {
    const [adjustmentDetail] = adjustment.details;

    await createInventoryMovement({
        tx,
        movementType: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
        reference: {
            stockAdjustmentId: adjustment.id,
            ...(goodsIssueId && { goodsIssueId }),
            ...(goodsReceiptId && { goodsReceiptId })
        },
        details: [buildInventoryMovementDetail({
            quantity: difference,
            newStock,
            previousStock,
            materialId,
            supplierId,
            stockAdjustmentDetailId: adjustmentDetail.id,
            goodsIssueDetailId,
            goodsReceiptDetailId
        })]
    });
};

const calculateStockAdjustmentValues = ({
    supplierMaterial,
    newStock,
    base = null,
    height = null
}) => {

    assertPieceQuantity({ quantity: newStock, item: supplierMaterial.material });
    const previousStock = toNumber(supplierMaterial.currentStock) || 0;
    const difference = normalizeDecimal(newStock - previousStock);
    const previousConvertedQuantity = toNumber(supplierMaterial.convertedQuantity) || 0;
    const hasCustomDimensions = base !== null && height !== null;
    const materialBase = hasCustomDimensions ? base : supplierMaterial.material.base;
    const materialHeight = hasCustomDimensions ? height : supplierMaterial.material.height;
    const calculatedNewConvertedQuantity = hasCustomDimensions
        ? previousConvertedQuantity + calculateConvertedQuantity({
            quantity: difference,
            base: materialBase,
            height: materialHeight
        })
        : calculateConvertedQuantity({
            currentStock: newStock,
            base: materialBase,
            height: materialHeight
        });
    const newConvertedQuantity = normalizeDecimal(calculatedNewConvertedQuantity);
    const convertedDifference = normalizeDecimal(
        newConvertedQuantity - previousConvertedQuantity
    );

    assertSufficientStock({
        material: supplierMaterial,
        newStock,
        newConvertedQuantity,
        requestedQuantity: Math.abs(difference)
    });

    return {
        previousStock,
        newStock,
        difference,
        previousConvertedQuantity,
        newConvertedQuantity,
        convertedDifference,
        materialBase,
        materialHeight
    };
};

export const createStockAdjustment = async ({
    tx = null,
    materialId,
    supplierId,
    reasonId,
    observations,
    newStock,
    userId,
    base = null,
    height = null,
    goodsIssueId = null,
    goodsIssueDetailId = null,
    goodsReceiptId = null,
    goodsReceiptDetailId = null,
    returnAdjustment = false,
    expectedVersion,
    supplierMaterial: protectedSupplierMaterial = null
}) => {

    let referenceNumber = null;

    const execute = async (transaction) => {

        if (!protectedSupplierMaterial) await lockSupplierMaterialStock({ tx: transaction, materialId, supplierId });
        const supplierMaterial = protectedSupplierMaterial ?? await findSupplierMaterialByIds({
            tx: transaction, materialId, supplierId
        });

        assertRecordVersion(supplierMaterial, expectedVersion);
        referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.STOCK_ADJUSTMENT, tx: transaction });

        const materialName = supplierMaterial.material.name;

        const {
            previousStock,
            newStock: adjustedNewStock,
            difference,
            previousConvertedQuantity,
            newConvertedQuantity,
            convertedDifference,
            materialBase,
            materialHeight
        } = calculateStockAdjustmentValues({
            supplierMaterial,
            newStock,
            base,
            height
        });

        const adjustmentType = difference >= 0
            ? STOCK_ADJUSTMENT_TYPES.INCREASE
            : STOCK_ADJUSTMENT_TYPES.DECREASE;

        const adjustment = await transaction.stockAdjustment.create({
            data: {
                referenceNumber,
                type: adjustmentType,
                observations,
                status: STOCK_ADJUSTMENT_STATUS_NAMES.APPLIED,
                appliedAt: new Date(),
                reason: {
                    connect: { id: reasonId }
                },
                createdBy: {
                    connect: {
                        id: userId
                    }
                },
                approvedBy: {
                    connect: {
                        id: userId
                    }
                },
                details: {
                    create: {
                        materialId,
                        supplierId,
                        materialName,

                        previousStock,
                        newStock: adjustedNewStock,
                        difference,

                        previousConvertedQuantity,
                        newConvertedQuantity,
                        convertedDifference
                    }
                }
            },
            include: {
                details: true
            }
        });

        await createStockAdjustmentMovement({
            tx: transaction,
            adjustment,
            materialId,
            supplierId,
            goodsIssueId,
            goodsIssueDetailId,
            goodsReceiptId,
            goodsReceiptDetailId,
            previousStock,
            newStock: adjustedNewStock,
            difference
        });

        const updatedSupplierMaterial = await adjustSupplierMaterialStock({
            tx: transaction,
            materialId,
            supplierId,
            newStock: adjustedNewStock,
            newConvertedQuantity
        });

        return returnAdjustment ? adjustment : updatedSupplierMaterial;
    };

    try {
        if (tx) return await execute(tx);

        return await getDb().$transaction(execute);
    } catch (err) {
        throwIfReferenceNumberAlreadyExists({ err, referenceNumber });
        throw err;
    }
};

export const createInitialMaterialStockBatch = async ({ tx, entries, userId, reasonId }) => {
    if (!entries.length) return [];
    const references = await reserveYearlyReferenceNumbers({ type: DOCUMENT_REFERENCE_TYPES.STOCK_ADJUSTMENT, tx, count: entries.length });
    const adjustments = [];
    const details = [];
    const movements = [];
    const movementDetails = [];
    const changes = [];
    const now = new Date();
    entries.forEach((entry, index) => {
        const { materialId, supplierId, observations, newStock, supplierMaterial } = entry;
        const values = calculateStockAdjustmentValues({ supplierMaterial, newStock });
        const adjustmentId = randomUUID();
        const detailId = randomUUID();
        const movementId = randomUUID();
        adjustments.push({ id: adjustmentId, referenceNumber: references[index],
            type: STOCK_ADJUSTMENT_TYPES.INCREASE, reasonId, observations, status: STOCK_ADJUSTMENT_STATUS_NAMES.APPLIED,
            appliedAt: now, createdById: userId, approvedById: userId });
        details.push({ id: detailId, stockAdjustmentId: adjustmentId, materialId, supplierId,
            materialName: supplierMaterial.material.name,
            previousStock: values.previousStock, newStock: values.newStock, difference: values.difference,
            previousConvertedQuantity: values.previousConvertedQuantity, newConvertedQuantity: values.newConvertedQuantity,
            convertedDifference: values.convertedDifference });
        movements.push({ id: movementId, type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT, stockAdjustmentId: adjustmentId });
        movementDetails.push({ movementId, ...buildInventoryMovementDetail({ materialId, supplierId,
            stockAdjustmentDetailId: detailId, quantity: values.difference,
            previousStock: values.previousStock, newStock: values.newStock }) });
        changes.push({ materialId, supplierId, quantityChange: values.difference, convertedQuantityChange: values.convertedDifference });
    });
    await tx.stockAdjustment.createMany({ data: adjustments });
    await tx.stockAdjustmentDetail.createMany({ data: details });
    await tx.inventoryMovement.createMany({ data: movements });
    await tx.movementDetail.createMany({ data: movementDetails });
    const balances = await updateSupplierMaterialStocks({ tx, changes });
    if (balances.length !== entries.length) throw new RecordVersionConflictError();
    return references;
};
