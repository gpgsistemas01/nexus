import { AdjustmentStatus, StockAdjustmentType } from "../../../generated/prisma/enums.ts";
import { getDb } from "../../repository/baseRepository.js";
import { generateYearlyReferenceNumber } from "../document/referenceNumberService.js";
import { normalizeDecimal, toNumber } from "../../utils/formattersUtils.js";
import { assertSufficientStock, calculateConvertedQuantity } from "../inventory/stockHelpers.js";
import { createStockAdjustmentMovement } from "../inventory/movementService.js";
import { adjustSupplierProductStock, findSupplierProductByIds } from "./products/supplierProductService.js";

const REFERENCE_NUMBER_TYPE = 'AJU';

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

const createStockAdjustmentInTransaction = async ({
    tx,
    productId,
    supplierId,
    reasonId,
    observations,
    newStock,
    userId,
    base = null,
    height = null
}) => {

    const product = await findSupplierProductByIds({
        tx,
        productId,
        supplierId
    });

    const referenceNumber = await generateYearlyReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

    const productName = product.name;
    const supplierName = product.supplier?.tradeName || '';

    const {
        previousStock,
        difference,
        previousConvertedQuantity,
        newConvertedQuantity,
        convertedDifference,
        productBase,
        productHeight
    } = calculateStockAdjustmentValues({
        product,
        newStock,
        base,
        height
    });

    const adjustmentType = difference >= 0
        ? StockAdjustmentType.INCREASE
        : StockAdjustmentType.DECREASE;

    const adjustment = await tx.stockAdjustment.create({
        data: {
            referenceNumber,
            type: adjustmentType,
            observations,
            status: AdjustmentStatus.APPLIED,
            appliedAt: new Date(),
            reason: {
                connect: {
                    id: reasonId
                }
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
                    newStock,
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
        tx,
        adjustment,
        productId,
        supplierId,
        reasonId,
        previousStock,
        previousConvertedQuantity,
        newStock,
        newConvertedQuantity,
        difference,
        convertedDifference
    });

    return adjustSupplierProductStock({
        tx,
        productId,
        supplierId,
        newStock,
        newConvertedQuantity
    });
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
    height = null
}) => {

    const execute = (transaction) => createStockAdjustmentInTransaction({
        tx: transaction,
        productId,
        supplierId,
        reasonId,
        observations,
        newStock,
        userId,
        base,
        height
    });

    if (tx) return execute(tx);

    return getDb().$transaction(execute);
};
