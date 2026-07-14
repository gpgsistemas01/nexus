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
import { createGoodsReceiptCorrectionAdjustments } from '../adjustmentService.js';
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


const correctionObservationByType = {
    PRODUCT: 'Corrección de compra: se actualiza el detalle por cambio de producto.',
    QUANTITY: 'Corrección de compra: se actualiza el detalle por cambio de cantidad.',
    COST: 'Corrección de compra: se actualiza el detalle por cambio de costo.',
    PRODUCT_AND_QUANTITY: 'Corrección de compra: se actualiza el detalle por cambio de producto y cantidad.',
    PRODUCT_AND_COST: 'Corrección de compra: se actualiza el detalle por cambio de producto y costo.',
    QUANTITY_AND_COST: 'Corrección de compra: se actualiza el detalle por cambio de cantidad y costo.',
    PRODUCT_AND_QUANTITY_AND_COST: 'Corrección de compra: se actualiza el detalle por cambio de producto, cantidad y costo.'
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
            }]);
            const productChanged = currentDetail.productId !== correctedDetail.productId;
            const quantityDifference = Number(correctedDetail.quantity) - Number(currentDetail.quantity);
            const costDifference = Number(correctedDetail.costPerUnitType) - Number(currentDetail.costPerUnitType);
            const hasChanges = productChanged || quantityDifference !== 0 || costDifference !== 0;

            if (!hasChanges) throw new GoodsReceiptCorrectionNoChanges();

            const correctionType = buildCorrectionType({ productChanged, quantityDifference, costDifference });
            const observations = correctionObservationByType[correctionType];

            const correctionReason = await findGoodsReceiptCorrectionReason({ tx });

            if (!correctionReason) throw new GoodsReceiptCorrectionReasonNotFound();

            const adjustments = await createGoodsReceiptCorrectionAdjustments({
                tx,
                currentDetail,
                correctedDetail,
                reasonId: correctionReason.id,
                userId,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId
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
                    observations,

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
