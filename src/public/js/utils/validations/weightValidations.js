import { WASTE_WEIGHT_LIMITS } from '../../constants/inventory.js';

const wasteWeightDecimalPattern = new RegExp(`^\\d{1,${WASTE_WEIGHT_LIMITS.INTEGER_DIGITS}}(\\.\\d{1,${WASTE_WEIGHT_LIMITS.DECIMAL_DIGITS}})?$`);

// Validate the original value before numeric conversion can discard format or precision.
const getWasteWeightValidationError = (value, { allowZero = false } = {}) => {
    if (value === undefined || value === null || value === '') return null;

    if (
        (typeof value !== 'number' && typeof value !== 'string')
        || !Number.isFinite(Number(value))
        || (allowZero ? Number(value) < 0 : Number(value) <= 0)
        || (typeof value === 'string' && (value.trim() !== value || !/^\d+(\.\d+)?$/.test(value)))
    ) return allowZero ? 'CONE_WEIGHT_KG_INVALID_NUMBER' : 'WEIGHT_KG_INVALID_NUMBER';

    if (Number(value) > WASTE_WEIGHT_LIMITS.MAX) return 'WEIGHT_KG_TOO_HIGH';
    if (!wasteWeightDecimalPattern.test(String(value))) return 'WEIGHT_KG_TOO_LONG';

    return null;
};

const hasWasteWeight = value => value !== undefined && value !== null && value !== '';

export const getWasteWeightCaptureValidationError = (value, {
    fieldName, coneFieldName = 'coneWeightKg', totalFieldName = 'totalWeightKg', requireTotal = true, ...data
}) => {
    const isCone = fieldName === coneFieldName;
    const coneWeightKg = isCone ? value : data[coneFieldName];
    const totalWeightKg = isCone ? data[totalFieldName] : value;
    const error = getWasteWeightValidationError(value, { allowZero: isCone });
    if (error) return error;

    if (!hasWasteWeight(value) && hasWasteWeight(isCone ? totalWeightKg : coneWeightKg) && (isCone || requireTotal)) {
        return isCone ? 'CONE_WEIGHT_KG_REQUIRED' : 'TOTAL_WEIGHT_KG_REQUIRED';
    }

    if (!isCone && hasWasteWeight(totalWeightKg) && hasWasteWeight(coneWeightKg)
        && !getWasteWeightValidationError(coneWeightKg, { allowZero: true })
        && Number(totalWeightKg) <= Number(coneWeightKg)) return 'WASTE_TOTAL_WEIGHT_NOT_GREATER';

    return null;
};

