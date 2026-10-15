import { GoodsReceiptDetailAlreadyCanceled } from '../../../errors/warehouse/goodsReceiptError.js';
import { GOODS_RECEIPT_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import { buildGoodsReceiptDetails, calculateGoodsReceiptTotals, GOODS_RECEIPT_DETAIL_INCLUDE } from './goodsReceiptHelpers.js';

const updateActiveGoodsReceiptDetailAndTotals = async ({ tx, goodsReceiptId, detailId, detailData }) => {
    const [updatedDetail] = await tx.goodsReceiptDetail.updateManyAndReturn({
        where: {
            id: detailId,
            goodsReceiptId,
            status: 'ACTIVE'
        },
        data: detailData
    });

    // El servicio llamador conserva el bloqueo de la compra durante el cambio y sus totales.
    if (!updatedDetail) throw new GoodsReceiptDetailAlreadyCanceled();

    const receiptDetails = await tx.goodsReceiptDetail.findMany({
        where: { goodsReceiptId },
        select: {
            status: true,
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });
    const allDetailsCanceled = receiptDetails.every(detail => detail.status === 'CANCELED');
    const totals = calculateGoodsReceiptTotals(receiptDetails, {
        includeCanceled: allDetailsCanceled
    });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: {
            ...totals,
            ...(allDetailsCanceled && {
                status: {
                    connect: {
                        name: GOODS_RECEIPT_STATUS_NAMES.CANCELED
                    }
                }
            })
        },
        include: {
            details: {
                include: GOODS_RECEIPT_DETAIL_INCLUDE
            },
            supplier: true,
            status: true
        }
    });

    return {
        updatedDetail,
        updatedReceipt
    };
};

export const correctGoodsReceiptDetailAndTotals = ({ tx, goodsReceiptId, detailId, correctedDetail }) => (
    updateActiveGoodsReceiptDetailAndTotals({
        tx,
        goodsReceiptId,
        detailId,
        detailData: correctedDetail
    })
);

export const cancelGoodsReceiptDetailAndTotals = ({ tx, goodsReceiptId, detailId }) => (
    updateActiveGoodsReceiptDetailAndTotals({
        tx,
        goodsReceiptId,
        detailId,
        detailData: { status: 'CANCELED' }
    })
);

export const createGoodsReceiptDetailsAndUpdateTotals = async ({ tx, goodsReceiptId, supplierId, details, type = null }) => {
    const processedDetails = await buildGoodsReceiptDetails(details, { tx, supplierId, type });
    const createdDetails = await tx.goodsReceiptDetail.createManyAndReturn({
        data: processedDetails.map(detail => ({
            ...detail,
            goodsReceiptId
        }))
    });

    const receiptDetails = await tx.goodsReceiptDetail.findMany({
        where: { goodsReceiptId },
        select: {
            status: true,
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: calculateGoodsReceiptTotals(receiptDetails),
        include: {
            details: {
                include: GOODS_RECEIPT_DETAIL_INCLUDE
            },
            supplier: true,
            status: true
        }
    });

    return {
        createdDetails,
        updatedReceipt
    };
};
