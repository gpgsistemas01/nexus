import { roundTo, normalizeDecimal } from '../utils/numberUtils.js';

export const VAT_RATE = 0.16;
export const VAT_MULTIPLIER = 1 + VAT_RATE;

export const calculateGoodsReceiptDetailAmounts = ({ quantity, costPerUnitType, base, height }) => {
    const numericQuantity = Number(quantity);
    const numericCost = Number(costPerUnitType);
    const convertedQuantity = Number(base) > 0 && Number(height) > 0
        ? normalizeDecimal(Number(base) * Number(height) * numericQuantity)
        : normalizeDecimal(numericQuantity);
    const netPurchaseAmount = roundTo(numericQuantity * numericCost);

    return {
        quantity: numericQuantity,
        costPerUnitType: numericCost,
        convertedQuantity,
        conversionUnitCost: convertedQuantity > 0 ? roundTo(netPurchaseAmount / convertedQuantity) : 0,
        netPurchaseAmount,
        grossPurchaseAmount: roundTo(netPurchaseAmount * VAT_MULTIPLIER)
    };
};
