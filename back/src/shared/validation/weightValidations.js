import { WASTE_WEIGHT_LIMITS } from '../constants/inventory.js';

const wasteWeightDecimalPattern = new RegExp(`^\\d{1,${WASTE_WEIGHT_LIMITS.INTEGER_DIGITS}}(\\.\\d{1,${WASTE_WEIGHT_LIMITS.DECIMAL_DIGITS}})?$`);

const hasWasteWeight = value => value !== undefined && value !== null && value !== '';

export const wasteWeightRules = {
    isNumber: (value, { allowZero = false } = {}) => !hasWasteWeight(value) || (
        (typeof value === 'number' || typeof value === 'string')
        && Number.isFinite(Number(value))
        && (allowZero ? Number(value) >= 0 : Number(value) > 0)
        && (typeof value !== 'string' || (value.trim() === value && /^\d+(\.\d+)?$/.test(value)))
    ),
    isWithinLimit: value => !hasWasteWeight(value) || Number(value) <= WASTE_WEIGHT_LIMITS.MAX,
    hasValidPrecision: value => !hasWasteWeight(value) || wasteWeightDecimalPattern.test(String(value)),
    hasRequiredPair: (value, { pairedValue, required = true }) =>
        hasWasteWeight(value) || !hasWasteWeight(pairedValue) || !required,
    isTotalGreaterThanCone: (totalWeightKg, coneWeightKg) =>
        !hasWasteWeight(totalWeightKg) || !hasWasteWeight(coneWeightKg)
        || Boolean(getWasteWeightValidationError(coneWeightKg, { allowZero: true }))
        || Number(totalWeightKg) > Number(coneWeightKg)
};

// Validate the original value before numeric conversion can discard format or precision.
export const getWasteWeightValidationError = (value, { allowZero = false } = {}) => {
    if (!wasteWeightRules.isNumber(value, { allowZero })) return allowZero ? 'CONE_WEIGHT_KG_INVALID_NUMBER' : 'WEIGHT_KG_INVALID_NUMBER';

    if (!wasteWeightRules.isWithinLimit(value)) return 'WEIGHT_KG_TOO_HIGH';
    if (!wasteWeightRules.hasValidPrecision(value)) return 'WEIGHT_KG_TOO_LONG';

    return null;
};

export const getWasteWeightCaptureValidationError = (value, {
    fieldName, coneFieldName = 'coneWeightKg', totalFieldName = 'totalWeightKg', requireTotal = true,
    requiredCode = 'TOTAL_WEIGHT_KG_REQUIRED', notGreaterCode = 'WASTE_TOTAL_WEIGHT_NOT_GREATER', ...data
}) => {
    const isCone = fieldName === coneFieldName;
    const coneWeightKg = isCone ? value : data[coneFieldName];
    const totalWeightKg = isCone ? data[totalFieldName] : value;
    const error = getWasteWeightValidationError(value, { allowZero: isCone });
    if (error) return error;

    if (!wasteWeightRules.hasRequiredPair(value, {
        pairedValue: isCone ? totalWeightKg : coneWeightKg,
        required: isCone || requireTotal
    })) {
        return isCone ? 'CONE_WEIGHT_KG_REQUIRED' : requiredCode;
    }

    if (!isCone && !wasteWeightRules.isTotalGreaterThanCone(totalWeightKg, coneWeightKg)) return notGreaterCode;

    return null;
};

