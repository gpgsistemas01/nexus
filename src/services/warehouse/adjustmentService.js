import { getDb } from "../../repository/baseRepository.js";
import { generateYearlyReferenceNumber, throwIfReferenceNumberAlreadyExists } from "../document/referenceNumberService.js";
import { normalizeDecimal, toNumber } from "../../utils/formattersUtils.js";
import { assertSufficientStock, calculateConvertedQuantity } from "../inventory/stockHelpers.js";
import { adjustSupplierMaterialStock, findSupplierMaterialByIds } from "./materials/supplierMaterialService.js";
import { INVENTORY_MOVEMENT_TYPES, STOCK_ADJUSTMENT_STATUS_NAMES, STOCK_ADJUSTMENT_TYPES } from "../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../constants/documentReferenceTypes.js";
import { createInventoryMovement } from "../inventory/movementService.js";
import { buildInventoryMovementDetail } from "../inventory/movementHelpers.js";

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
    material,
    newStock,
    base = null,
    height = null
}) => {

    const previousStock = Number(toNumber(material.currentStock) || 0);
    const difference = normalizeDecimal(newStock - previousStock);
    const previousConvertedQuantity = Number(toNumber(material.convertedQuantity) || 0);
    const hasCustomDimensions = base !== null && height !== null;
    const materialBase = hasCustomDimensions ? base : material.base;
    const materialHeight = hasCustomDimensions ? height : material.height;
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
        material,
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
    returnAdjustment = false
}) => {

    let referenceNumber = null;

    const execute = async (transaction) => {

        const material = await findSupplierMaterialByIds({
            tx: transaction,
            materialId,
            supplierId
        });

        referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.STOCK_ADJUSTMENT, tx: transaction });

        const materialName = material.name;

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
            material,
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

export const createStockAdjustmentByQuantityChange = async ({
    tx = null,
    materialId,
    supplierId,
    reasonId,
    observations,
    quantityChange,
    userId,
    base = null,
    height = null,
    goodsIssueId = null,
    goodsIssueDetailId = null,
    goodsReceiptId = null,
    goodsReceiptDetailId = null,
    returnAdjustment = false
}) => {

    const execute = async (transaction) => {
        const material = await findSupplierMaterialByIds({
            tx: transaction,
            materialId,
            supplierId
        });
        const newStock = normalizeDecimal(Number(toNumber(material.currentStock) || 0) + Number(quantityChange));

        return createStockAdjustment({
            tx: transaction,
            materialId,
            supplierId,
            reasonId,
            observations,
            newStock,
            userId,
            base,
            height,
            goodsIssueId,
            goodsIssueDetailId,
            goodsReceiptId,
            goodsReceiptDetailId,
            returnAdjustment
        });
    };

    if (tx) return execute(tx);

    return getDb().$transaction(execute);
};
