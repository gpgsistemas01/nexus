import { GOODS_RECEIPT_DETAIL_STATUSES, GOODS_RECEIPT_STATUS_LABELS } from "../../../constants/goodsReceiptStatuses.js";

export const buildGoodsReceiptModalDetails = (receipt) => {
    const isCanceledReceipt = receipt.status?.name === GOODS_RECEIPT_STATUS_LABELS.CANCELED;

    return receipt.details
        .filter(detail => isCanceledReceipt
            ? detail.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED
            : detail.status !== GOODS_RECEIPT_DETAIL_STATUSES.CANCELED)
        .map(detail => ({
            ...detail,
            materialBase: detail.materialBase ?? detail.material?.base ?? null,
            materialHeight: detail.materialHeight ?? detail.material?.height ?? null,
            presentationId: detail.presentationId ?? detail.material?.presentation?.id ?? null,
            presentationName: detail.presentationName ?? detail.material?.presentation?.name ?? '',
            unitMeasureId: detail.unitMeasureId ?? detail.material?.unitMeasure?.id ?? null,
            unitMeasureName: detail.unitMeasureName ?? detail.material?.unitMeasure?.name ?? '',
            unitMeasureSymbol: detail.unitMeasureSymbol ?? detail.material?.unitMeasure?.symbol ?? '',
            supplierName: receipt.supplierName,
            goodsReceiptStatusName: receipt.status?.name
        }));
};
