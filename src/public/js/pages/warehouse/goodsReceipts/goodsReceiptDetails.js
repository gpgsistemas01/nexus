import { GOODS_RECEIPT_DETAIL_STATUSES, GOODS_RECEIPT_STATUS_LABELS } from "../../../constants/goodsReceiptStatuses.js";

export const buildGoodsReceiptModalDetails = (receipt) => {
    const isCanceledReceipt = receipt.status?.name === GOODS_RECEIPT_STATUS_LABELS.CANCELED;

    return receipt.details
        .filter(detail => isCanceledReceipt
            ? detail.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED
            : detail.status !== GOODS_RECEIPT_DETAIL_STATUSES.CANCELED)
        .map(detail => ({
            ...detail,
            supplierName: receipt.supplierName,
            goodsReceiptStatusName: receipt.status?.name
        }));
};
