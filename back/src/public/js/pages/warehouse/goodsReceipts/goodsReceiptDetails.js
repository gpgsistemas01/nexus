import { calculateGoodsReceiptDetailAmounts } from '../../../../../shared/inventory/goodsReceiptCalculations.js';
import { GOODS_RECEIPT_DETAIL_STATUSES } from '../../../../../shared/constants/goodsReceiptStatuses.js';
import { GOODS_RECEIPT_STATUS_LABELS } from '../../../constants/goodsReceiptStatuses.js';
import {
    buildInventorySelectText,
    getBase,
    getHeight,
    getPresentation,
    getPresentationId,
    getUnitMeasure,
    getUnitMeasureId
} from '../../../utils/warehouseInventoryUtils.js';

export const mapGoodsReceiptSelectionToDetail = ({ optionData, quantity, costPerUnitType }) => {
    const { material, supplier } = optionData;
    const base = getBase(material);
    const height = getHeight(material);

    return {
        materialId: material.id,
        name: buildInventorySelectText({ material, supplier }),
        base,
        height,
        presentation: getPresentation(material),
        unitMeasure: getUnitMeasure(material),
        supplier,
        ...calculateGoodsReceiptDetailAmounts({ quantity, costPerUnitType, base, height })
    };
};

export const buildGoodsReceiptModalDetails = (receipt) => {
    const isCanceledReceipt = receipt.status?.name === GOODS_RECEIPT_STATUS_LABELS.CANCELED;

    return receipt.details
        .filter(detail => isCanceledReceipt
            ? detail.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED
            : detail.status !== GOODS_RECEIPT_DETAIL_STATUSES.CANCELED)
        .map(detail => ({
            ...detail,
            name: buildInventorySelectText({ ...detail, supplier: receipt.supplier }),
            base: getBase(detail),
            height: getHeight(detail),
            presentation: getPresentation(detail),
            unitMeasure: getUnitMeasure(detail),
            supplier: receipt.supplier,
            presentationId: getPresentationId(detail),
            unitMeasureId: getUnitMeasureId(detail),
            goodsReceiptStatusName: receipt.status?.name
        }));
};
