import { getWasteWeightValidationError } from './warehouseInventoryUtils.js';
import { roundTo } from './formatUtils.js';

export const CONE_WEIGHT_MODES = Object.freeze({ FIXED: 'FIXED', VARIABLE: 'VARIABLE' });
export const LENGTH_SOURCES = Object.freeze({ MEASURED: 'MEASURED', ESTIMATED: 'ESTIMATED' });

const hasValue = value => value !== undefined && value !== null && value !== '';

export const getRollReferenceValidationError = (value, data, field) => {
    if (field === 'coneWeightMode') return Object.values(CONE_WEIGHT_MODES).includes(value) ? null : 'CONE_WEIGHT_MODE_INVALID';
    const cone = field === 'referenceConeWeightKg';
    const error = getWasteWeightValidationError(value, { allowZero: cone });
    if (error) return error;
    if (cone && !hasValue(value) && (data.coneWeightMode === CONE_WEIGHT_MODES.FIXED || hasValue(data.referenceRollTotalWeightKg))) return 'CONE_WEIGHT_KG_REQUIRED';
    if (!cone && hasValue(value) && hasValue(data.referenceConeWeightKg) && Number(value) <= Number(data.referenceConeWeightKg)) return 'WASTE_TOTAL_WEIGHT_NOT_GREATER';
    return null;
};

export const calculateWasteRollLength = ({ netWeightKg, referenceNetWeightKg, referenceLengthM, referenceWidthM, widthM }) => {
    if (![netWeightKg, referenceNetWeightKg, referenceLengthM, referenceWidthM, widthM].every(value => Number(value) > 0)) return null;
    return roundTo(Number(netWeightKg) * Number(referenceLengthM) * Number(referenceWidthM) / (Number(referenceNetWeightKg) * Number(widthM)));
};
