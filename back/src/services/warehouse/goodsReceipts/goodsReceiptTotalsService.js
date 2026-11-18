import { ensureSupplierMaterials } from '../materials/supplierMaterialService.js';
import { GoodsReceiptDetailAlreadyCanceled } from '../../../errors/warehouse/goodsReceiptError.js';
import { GOODS_RECEIPT_STATUS_NAMES, GOODS_RECEIPT_DETAIL_STATUSES } from '../../../shared/constants/goodsReceiptStatuses.js';
import { buildGoodsReceiptDetails, GOODS_RECEIPT_DETAIL_INCLUDE } from './goodsReceiptHelpers.js';

const findActiveGoodsReceiptTotals = async ({ tx, goodsReceiptId }) => {
    const { _sum, _count } = await tx.goodsReceiptDetail.aggregate({
        where: { goodsReceiptId, status: GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE },
        _sum: { quantity: true, netPurchaseAmount: true, grossPurchaseAmount: true },
        _count: { _all: true }
    });
    return {
        activeCount: _count._all,
        totals: {
            totalQuantity: _sum.quantity ?? 0,
            totalNetPurchaseAmount: _sum.netPurchaseAmount ?? 0,
            totalGrossPurchaseAmount: _sum.grossPurchaseAmount ?? 0
        }
    };
};

const updateActiveGoodsReceiptDetailAndTotals = async ({ tx, goodsReceiptId, detailId, detailData }) => {
    const [updatedDetail] = await tx.goodsReceiptDetail.updateManyAndReturn({
        where: {
            id: detailId,
            goodsReceiptId,
            status: GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE
        },
        data: detailData
    });

    // El servicio llamador conserva el bloqueo de la compra durante el cambio y sus totales.
    if (!updatedDetail) throw new GoodsReceiptDetailAlreadyCanceled();

    const { activeCount, totals } = await findActiveGoodsReceiptTotals({ tx, goodsReceiptId });
    const allDetailsCanceled = activeCount === 0;

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: {
            ...(!allDetailsCanceled && totals),
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
    await ensureSupplierMaterials({ tx, supplierId, materialIds: processedDetails.map(detail => detail.materialId) });
    const createdDetails = await tx.goodsReceiptDetail.createManyAndReturn({
        data: processedDetails.map(detail => ({
            ...detail,
            goodsReceiptId
        }))
    });

    const { totals } = await findActiveGoodsReceiptTotals({ tx, goodsReceiptId });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: totals,
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
