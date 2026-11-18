import { isFixedUnitPresentation } from './wasteMeasurements.js';
import { roundTo, normalizeDecimal } from '../utils/numberUtils.js';

export const usesAutomaticTotalCost = ({ base, height, presentation } = {}) =>
    isFixedUnitPresentation(presentation) && Number(base) === 1 && Number(height) === 1;

export const VAT_RATE = 0.16;
export const VAT_MULTIPLIER = 1 + VAT_RATE;

export const calculateGoodsReceiptDetailAmounts = ({ quantity, costPerUnitType, base, height, costIsTotal = false }) => {
    const numericQuantity = Number(quantity);
    const numericCost = Number(costPerUnitType);
    const convertedQuantity = Number(base) > 0 && Number(height) > 0
        ? normalizeDecimal(Number(base) * Number(height) * numericQuantity)
        : normalizeDecimal(numericQuantity);
    const unitQuantity = costIsTotal ? numericQuantity : convertedQuantity;
    const netPurchaseAmount = roundTo(costIsTotal ? numericCost : numericQuantity * numericCost);

    return {
        ...(costIsTotal && { costIsTotal: true }),
        quantity: numericQuantity,
        costPerUnitType: numericCost,
        convertedQuantity,
        conversionUnitCost: unitQuantity > 0 ? roundTo(netPurchaseAmount / unitQuantity) : 0,
        netPurchaseAmount,
        grossPurchaseAmount: roundTo(netPurchaseAmount * VAT_MULTIPLIER)
    };
};
