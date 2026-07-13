import { AppError } from '../../../errors/AppError.js';
import {
    GoodsReceiptNotFound,
    GoodsReceiptUpdateDatabaseError
} from '../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { createServiceLogger, getModelLogContext, logServiceError } from '../../../utils/logger.js';
import { createStockAdjustment } from '../adjustmentService.js';
import { findSupplierProductByIds, updateProductUnitCostIfHigher } from '../products/supplierProductService.js';
import { buildGoodsReceiptDetails } from './goodsReceiptHelpers.js';

const serviceLogger = createServiceLogger('warehouse.goodsReceipts.goodsReceiptCorrectionService');
const CORRECTION_OBSERVATION_PREFIX = 'Corrección de compra';

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

const buildCorrectedReceiptDetail = async ({ productId, quantity, costPerUnitType }) => {
    const [correctedDetail] = await buildGoodsReceiptDetails([{ productId, quantity, costPerUnitType }]);

    return correctedDetail;
};

const buildCorrectionObservation = ({ observations, referenceNumber }) => (
    observations || `${ CORRECTION_OBSERVATION_PREFIX } ${ referenceNumber }`
);

const createCorrectionStockAdjustment = async ({
    tx,
    productId,
    supplierId,
    reasonId,
    observations,
    newStock,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
}) => createStockAdjustment({
    tx,
    productId,
    supplierId,
    reasonId,
    observations,
    newStock,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
});

const createOriginalLineReversal = async ({
    tx,
    currentDetail,
    correctionObservations,
    reasonId,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
}) => {
    const originalProduct = await findSupplierProductByIds({
        tx,
        productId: currentDetail.productId,
        supplierId: currentDetail.goodsReceipt.supplierId
    });

    return createCorrectionStockAdjustment({
        tx,
        productId: currentDetail.productId,
        supplierId: currentDetail.goodsReceipt.supplierId,
        reasonId,
        observations: `${ correctionObservations } | Reversa de línea registrada: ${ currentDetail.productName }`,
        newStock: Number(originalProduct.currentStock) - Number(currentDetail.quantity),
        userId,
        goodsReceiptId,
        goodsReceiptDetailId
    });
};

const createCorrectedLineEntry = async ({
    tx,
    currentDetail,
    correctedDetail,
    correctionObservations,
    reasonId,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
}) => {
    const correctedProduct = await findSupplierProductByIds({
        tx,
        productId: correctedDetail.productId,
        supplierId: currentDetail.goodsReceipt.supplierId
    });

    return createCorrectionStockAdjustment({
        tx,
        productId: correctedDetail.productId,
        supplierId: currentDetail.goodsReceipt.supplierId,
        reasonId,
        observations: `${ correctionObservations } | Ingreso de línea corregida: ${ correctedDetail.productName }`,
        newStock: Number(correctedProduct.currentStock) + Number(correctedDetail.quantity),
        userId,
        goodsReceiptId,
        goodsReceiptDetailId
    });
};

const createCorrectionAdjustments = async ({
    tx,
    currentDetail,
    correctedDetail,
    correctionObservations,
    reasonId,
    userId,
    goodsReceiptId,
    goodsReceiptDetailId
}) => {
    const adjustments = [];

    if (Number(currentDetail.quantity) > 0) {
        adjustments.push(await createOriginalLineReversal({
            tx,
            currentDetail,
            correctionObservations,
            reasonId,
            userId,
            goodsReceiptId,
            goodsReceiptDetailId
        }));
    }

    if (Number(correctedDetail.quantity) > 0) {
        adjustments.push(await createCorrectedLineEntry({
            tx,
            currentDetail,
            correctedDetail,
            correctionObservations,
            reasonId,
            userId,
            goodsReceiptId,
            goodsReceiptDetailId
        }));
    }

    return adjustments;
};

const updateReceiptDetailAndTotals = async ({ tx, goodsReceiptId, detailId, correctedDetail }) => {
    const updatedDetail = await tx.goodsReceiptDetail.update({
        where: { id: detailId },
        data: correctedDetail
    });

    const totals = await tx.goodsReceiptDetail.aggregate({
        where: { goodsReceiptId },
        _sum: {
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: {
            totalQuantity: totals._sum.quantity || 0,
            totalNetPurchaseAmount: totals._sum.netPurchaseAmount || 0,
            totalGrossPurchaseAmount: totals._sum.grossPurchaseAmount || 0
        },
        include: {
            details: true
        }
    });

    return {
        updatedDetail,
        updatedReceipt
    };
};

const buildCorrectionResult = ({ currentDetail, correctedDetail, adjustments, updatedDetail, updatedReceipt }) => ({
    updatedDetail,
    updatedReceipt,
    adjustments,
    costDifference: Number(correctedDetail.netPurchaseAmount) - Number(currentDetail.netPurchaseAmount)
});

export const correctGoodsReceiptDetailLine = async ({ id, correctionDto, userId }) => {
    const { detailId, productId, quantity, costPerUnitType, reasonId, observations } = correctionDto;

    try {
        const db = getDb();

        const result = await db.$transaction(async (tx) => {
            const currentDetail = await findReceiptDetailForCorrection({
                tx,
                goodsReceiptId: id,
                detailId
            });

            if (!currentDetail) throw new GoodsReceiptNotFound();

            const correctedDetail = await buildCorrectedReceiptDetail({
                productId,
                quantity,
                costPerUnitType
            });
            const correctionObservations = buildCorrectionObservation({
                observations,
                referenceNumber: currentDetail.goodsReceipt.referenceNumber
            });
            const adjustments = await createCorrectionAdjustments({
                tx,
                currentDetail,
                correctedDetail,
                correctionObservations,
                reasonId,
                userId,
                goodsReceiptId: id,
                goodsReceiptDetailId: detailId
            });
            const { updatedDetail, updatedReceipt } = await updateReceiptDetailAndTotals({
                tx,
                goodsReceiptId: id,
                detailId,
                correctedDetail
            });

            return buildCorrectionResult({
                currentDetail,
                correctedDetail,
                adjustments,
                updatedDetail,
                updatedReceipt
            });
        });

        await updateProductUnitCostIfHigher({
            supplierId: result.updatedReceipt.supplierId,
            details: [result.updatedDetail]
        });

        return result;
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsReceipts.goodsReceiptCorrectionService.correctGoodsReceiptDetailLine',
            ...getModelLogContext('goodsReceiptCorrection', { id, ...correctionDto })
        });

        if (err instanceof AppError) throw err;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
