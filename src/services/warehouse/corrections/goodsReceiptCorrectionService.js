import { AppError } from '../../../errors/AppError.js';
import { GoodsIssueInsufficientStock } from '../../../errors/inventory/stockError.js';
import {
    GoodsReceiptCorrectionInsufficientStock,
    GoodsReceiptCorrectionNoChanges,
    GoodsReceiptCorrectionReasonNotFound,
    GoodsReceiptNotFound,
    GoodsReceiptUpdateDatabaseError
} from '../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { createServiceLogger, getModelLogContext, logServiceError } from '../../../utils/logger.js';
import { createStockAdjustmentByQuantityChange } from '../adjustmentService.js';
import { updateProductUnitCostIfHigher } from '../products/supplierProductService.js';
import { buildGoodsReceiptDetails, updateGoodsReceiptDetailAndTotals } from '../goodsReceipts/goodsReceiptHelpers.js';
import { findGoodsReceiptCorrectionReason } from '../reasonService.js';

const serviceLogger = createServiceLogger('warehouse.corrections.goodsReceiptCorrectionService');

const findReceiptDetailForCorrection = ({ tx, goodsReceiptId, detailId }) => (
    tx.goodsReceiptDetail.findFirst({
        where: {
            id: detailId,
            goodsReceiptId
        },
        include: {
            goodsReceipt: true
        }
    })
);

const buildCorrectionAdjustmentObservations = ({ currentDetail, correctedDetail, goodsReceiptId }) => {
    const productChanged = currentDetail.productId !== correctedDetail.productId;
    const quantityDifference = Number(correctedDetail.quantity) - Number(currentDetail.quantity);
    const quantityChanged = quantityDifference !== 0;
    const receiptReference = currentDetail.goodsReceipt.referenceNumber || goodsReceiptId;
    const affectedFields = productChanged && quantityChanged
        ? 'producto y cantidad'
        : productChanged ? 'producto' : 'cantidad';
    const correctionContext = `Corrección de compra ${receiptReference}; campos afectados: ${affectedFields}.`;

    return {
        quantityIncrease: `${correctionContext} Ajuste de entrada por aumento de cantidad.`,
        quantityDecrease: `${correctionContext} Ajuste de salida por disminución de cantidad.`,
        reverseIncorrectProduct: `${correctionContext} Reversa de stock; se elimina el producto registrado incorrectamente.`,
        registerCorrectProduct: `${correctionContext} Ajuste de entrada; se registra el producto correcto.`
    };
};

const createGoodsReceiptCorrectionAdjustments = async ({
    tx,
    currentDetail,
    correctedDetail,
    reasonId,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId,
    adjustmentObservations
}) => {
    const productChanged = currentDetail.productId !== correctedDetail.productId;
    const quantityDifference = Number(correctedDetail.quantity) - Number(currentDetail.quantity);
    const quantityChanged = quantityDifference !== 0;
    const supplierId = currentDetail.goodsReceipt.supplierId;
    const createCorrectionAdjustment = ({
        productId,
        quantityChange,
        observations
    }) => createStockAdjustmentByQuantityChange({
        tx,
        productId,
        supplierId,
        reasonId,
        observations,
        quantityChange,
        userId,
        goodsReceiptId,
        goodsReceiptDetailId
    });

    if (!productChanged && !quantityChanged) return [];

    if (!productChanged) {
        return [await createCorrectionAdjustment({
            productId: currentDetail.productId,
            quantityChange: quantityDifference,
            observations: quantityDifference > 0
                ? adjustmentObservations.quantityIncrease
                : adjustmentObservations.quantityDecrease
        })];
    }

    const adjustments = [];

    if (Number(currentDetail.quantity) > 0) {
        adjustments.push(await createCorrectionAdjustment({
            productId: currentDetail.productId,
            quantityChange: -Number(currentDetail.quantity),
            observations: adjustmentObservations.reverseIncorrectProduct
        }));
    }

    if (Number(correctedDetail.quantity) > 0) {
        adjustments.push(await createCorrectionAdjustment({
            productId: correctedDetail.productId,
            quantityChange: Number(correctedDetail.quantity),
            observations: adjustmentObservations.registerCorrectProduct
        }));
    }

    return adjustments;
};

const buildCorrectionType = ({ productChanged, quantityDifference, costDifference }) => (
    [
        productChanged ? 'PRODUCT' : null,
        quantityDifference !== 0 ? 'QUANTITY' : null,
        costDifference !== 0 ? 'COST' : null
    ].filter(Boolean).join('_AND_')
);

export const correctGoodsReceiptDetailLine = async ({ id, detailId, correctionDto, userId }) => {
    const { productId, quantity, costPerUnitType } = correctionDto;

    try {
        const db = getDb();

        const result = await db.$transaction(async (tx) => {
            const currentDetail = await findReceiptDetailForCorrection({
                tx,
                goodsReceiptId: id,
                detailId
            });

            if (!currentDetail) throw new GoodsReceiptNotFound();

            const [correctedDetail] = await buildGoodsReceiptDetails([{
                productId,
                quantity,
                costPerUnitType
            }], { tx });
            const productChanged = currentDetail.productId !== correctedDetail.productId;
            const quantityDifference = Number(correctedDetail.quantity) - Number(currentDetail.quantity);
            const costDifference = Number(correctedDetail.costPerUnitType) - Number(currentDetail.costPerUnitType);
            const hasChanges = productChanged || quantityDifference !== 0 || costDifference !== 0;

            if (!hasChanges) throw new GoodsReceiptCorrectionNoChanges();

            const correctionType = buildCorrectionType({ productChanged, quantityDifference, costDifference });

            const correctionReason = await findGoodsReceiptCorrectionReason({ tx });

            if (!correctionReason) throw new GoodsReceiptCorrectionReasonNotFound();

            const adjustments = await createGoodsReceiptCorrectionAdjustments({
                tx,
                currentDetail,
                correctedDetail,
                reasonId: correctionReason.id,
                userId,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId,
                adjustmentObservations: buildCorrectionAdjustmentObservations({
                    currentDetail,
                    correctedDetail,
                    goodsReceiptId: id
                })
            });
            const { updatedDetail, updatedReceipt } = await updateGoodsReceiptDetailAndTotals({
                tx,
                goodsReceiptId: id,
                detailId,
                correctedDetail
            });
            const adjustmentLinks = adjustments.map(adjustment => ({ stockAdjustmentId: adjustment.id }));
            const correction = await tx.goodsReceiptCorrection.create({
                data: {
                    goodsReceiptId: id,
                    goodsReceiptDetailId: detailId,
                    reasonId: correctionReason.id,
                    previousProductId: currentDetail.productId,
                    previousProductName: currentDetail.productName,
                    previousQuantity: currentDetail.quantity,
                    previousCostPerUnitType: currentDetail.costPerUnitType,
                    previousNetPurchaseAmount: currentDetail.netPurchaseAmount,
                    previousGrossPurchaseAmount: currentDetail.grossPurchaseAmount,

                    correctedProductId: correctedDetail.productId,
                    correctedProductName: correctedDetail.productName,
                    correctedQuantity: correctedDetail.quantity,
                    correctedCostPerUnitType: correctedDetail.costPerUnitType,
                    correctedNetPurchaseAmount: correctedDetail.netPurchaseAmount,
                    correctedGrossPurchaseAmount: correctedDetail.grossPurchaseAmount,

                    correctionType,
                    productChanged,
                    quantityDifference,
                    costDifference,
                    ...(adjustmentLinks.length ? {
                        adjustments: {
                            create: adjustmentLinks
                        }
                    } : {})
                },
                include: {
                    adjustments: {
                        include: {
                            stockAdjustment: true
                        }
                    }
                }
            });

            return {
                updatedDetail,
                updatedReceipt,
                correction,
                adjustments,
                costDifference: Number(correctedDetail.netPurchaseAmount) - Number(currentDetail.netPurchaseAmount)
            };
        });

        await updateProductUnitCostIfHigher({
            supplierId: result.updatedReceipt.supplierId,
            details: [result.updatedDetail]
        });

        return result;
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.corrections.goodsReceiptCorrectionService.correctGoodsReceiptDetailLine',
            ...getModelLogContext('goodsReceiptCorrection', { id, ...correctionDto })
        });

        if (err instanceof GoodsIssueInsufficientStock) {
            throw new GoodsReceiptCorrectionInsufficientStock(err.meta);
        }

        if (err instanceof AppError) throw err;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
