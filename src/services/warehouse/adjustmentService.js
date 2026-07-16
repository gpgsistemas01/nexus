import { getDb } from "../../repository/baseRepository.js";
import { generateYearlyReferenceNumber } from "../document/referenceNumberService.js";
import { normalizeDecimal, toNumber } from "../../utils/formattersUtils.js";
import { assertSufficientStock, calculateConvertedQuantity } from "../inventory/stockHelpers.js";
import { createStockAdjustmentMovement } from "../inventory/movementService.js";
import { adjustSupplierProductStock, findSupplierProductByIds } from "./products/supplierProductService.js";
import { INVENTORY_MOVEMENT_TYPES, INVENTORY_REFERENCE_TYPES, STOCK_ADJUSTMENT_STATUS_NAMES, STOCK_ADJUSTMENT_TYPES } from "../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../constants/documentReferenceTypes.js";

const GOODS_RECEIPT_RETURN_REASON_NAME = 'Devolución de compra';
const GOODS_ISSUE_RETURN_REASON_NAME = 'Devolución de salida';
export const StockReturnSource = Object.freeze({
    GOODS_RECEIPT: INVENTORY_REFERENCE_TYPES.GOODS_RECEIPT,
    GOODS_ISSUE: INVENTORY_REFERENCE_TYPES.GOODS_ISSUE
});


const calculateStockAdjustmentValues = ({
    product,
    newStock,
    base = null,
    height = null
}) => {

    const previousStock = Number(toNumber(product.currentStock) || 0);
    const difference = normalizeDecimal(newStock - previousStock);
    const previousConvertedQuantity = Number(toNumber(product.convertedQuantity) || 0);
    const hasCustomDimensions = base !== null && height !== null;
    const productBase = hasCustomDimensions ? base : product.base;
    const productHeight = hasCustomDimensions ? height : product.height;
    const calculatedNewConvertedQuantity = hasCustomDimensions
        ? previousConvertedQuantity + calculateConvertedQuantity({
            quantity: difference,
            base: productBase,
            height: productHeight
        })
        : calculateConvertedQuantity({
            currentStock: newStock,
            base: productBase,
            height: productHeight
        });
    const newConvertedQuantity = normalizeDecimal(calculatedNewConvertedQuantity);
    const convertedDifference = normalizeDecimal(
        newConvertedQuantity - previousConvertedQuantity
    );

    assertSufficientStock({
        product,
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
        productBase,
        productHeight
    };
};

export const createStockAdjustment = async ({
    tx = null,
    productId,
    supplierId,
    reasonId,
    observations,
    newStock,
    userId,
    base = null,
    height = null,
    returnedQuantity = null,
    returnSource = StockReturnSource.GOODS_RECEIPT,
    goodsIssueId = null,
    goodsIssueDetailId = null,
    goodsReceiptId = null,
    goodsReceiptDetailId = null,
    returnCreatedAdjustment = false
}) => {

    const execute = async (transaction) => {

        const product = await findSupplierProductByIds({
            tx: transaction,
            productId,
            supplierId
        });

        const referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.STOCK_ADJUSTMENT, tx: transaction });

        const productName = product.name;
        const supplierName = product.supplier?.tradeName || '';
        const isReturnAdjustment = returnedQuantity !== null && returnedQuantity !== undefined;
        const currentStock = Number(toNumber(product.currentStock) || 0);
        const isGoodsReceiptReturn = returnSource === StockReturnSource.GOODS_RECEIPT;
        const returnSign = isGoodsReceiptReturn ? -1 : 1;
        const returnReasonName = isGoodsReceiptReturn
            ? GOODS_RECEIPT_RETURN_REASON_NAME
            : GOODS_ISSUE_RETURN_REASON_NAME;
        const resolvedNewStock = isReturnAdjustment
            ? normalizeDecimal(currentStock + (Number(returnedQuantity) * returnSign))
            : newStock;

        const {
            previousStock,
            newStock: adjustedNewStock,
            difference,
            previousConvertedQuantity,
            newConvertedQuantity,
            convertedDifference,
            productBase,
            productHeight
        } = calculateStockAdjustmentValues({
            product,
            newStock: resolvedNewStock,
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
                    connect: isReturnAdjustment
                        ? { name: returnReasonName }
                        : { id: reasonId }
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
                        productId,
                        supplierId,
                        productName,
                        supplierName,

                        previousStock,
                        newStock: adjustedNewStock,
                        difference,

                        previousConvertedQuantity,
                        newConvertedQuantity,
                        convertedDifference,

                        productBase,
                        productHeight
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
            productId,
            supplierId,
            reasonId,
            goodsIssueId,
            goodsIssueDetailId,
            goodsReceiptId,
            goodsReceiptDetailId,
            previousStock,
            previousConvertedQuantity,
            newStock: adjustedNewStock,
            newConvertedQuantity,
            difference,
            convertedDifference
        });

        const updatedSupplierProduct = await adjustSupplierProductStock({
            tx: transaction,
            productId,
            supplierId,
            newStock: adjustedNewStock,
            newConvertedQuantity
        });

        return returnCreatedAdjustment ? adjustment : updatedSupplierProduct;
    };

    if (tx) return execute(tx);

    return getDb().$transaction(execute);
};

export const createStockAdjustmentByQuantityChange = async ({
    tx = null,
    productId,
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
    returnCreatedAdjustment = false
}) => {

    const execute = async (transaction) => {
        const product = await findSupplierProductByIds({
            tx: transaction,
            productId,
            supplierId
        });
        const newStock = normalizeDecimal(Number(toNumber(product.currentStock) || 0) + Number(quantityChange));

        return createStockAdjustment({
            tx: transaction,
            productId,
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
            returnCreatedAdjustment
        });
    };

    if (tx) return execute(tx);

    return getDb().$transaction(execute);
};


export const createGoodsReceiptReturnStockAdjustment = ({
    tx = null,
    productId,
    supplierId,
    observations,
    returnedQuantity,
    userId,
    goodsReceiptId = null,
    goodsReceiptDetailId = null
}) => createStockAdjustment({
    tx,
    productId,
    supplierId,
    observations,
    returnedQuantity,
    returnSource: StockReturnSource.GOODS_RECEIPT,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
});

export const createGoodsIssueReturnStockAdjustment = ({
    tx,
    productId,
    supplierId,
    observations,
    returnedQuantity,
    userId,
    goodsIssueId,
    goodsIssueDetailId
}) => createStockAdjustment({
    tx,
    productId,
    supplierId,
    observations,
    returnedQuantity,
    returnSource: StockReturnSource.GOODS_ISSUE,
    userId,
    goodsIssueId,
    goodsIssueDetailId
});
