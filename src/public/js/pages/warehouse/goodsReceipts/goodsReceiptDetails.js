import { GOODS_RECEIPT_DETAIL_STATUSES, GOODS_RECEIPT_STATUS_LABELS } from "../../../constants/goodsReceiptStatuses.js";
import { roundTo } from '../../../utils/formatUtils.js';
import { buildInventorySelectText, getBase, getHeight, getPresentation, getPresentationId, getUnitMeasure, getUnitMeasureId } from '../../../utils/warehouseInventoryUtils.js';

const IVA_RATE = 1.16;

export const calculateGoodsReceiptDetailAmounts = ({ quantity, costPerUnitType, base, height }) => {
    const numericQuantity = Number(quantity);
    const numericCost = Number(costPerUnitType);
    const convertedQuantity = !base || !height
        ? numericQuantity
        : roundTo(Number(base) * Number(height) * numericQuantity);
    const netPurchaseAmount = roundTo(numericQuantity * numericCost);

    return {
        quantity: numericQuantity,
        costPerUnitType: numericCost,
        convertedQuantity,
        conversionUnitCost: convertedQuantity > 0
            ? roundTo(netPurchaseAmount / convertedQuantity)
            : 0,
        netPurchaseAmount,
        grossPurchaseAmount: roundTo(netPurchaseAmount * IVA_RATE)
    };
};

export const mapGoodsReceiptSelectionToDetail = ({ optionData, quantity, costPerUnitType }) => {
    const material = JSON.parse(optionData.material);
    const supplier = JSON.parse(optionData.supplier);
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
