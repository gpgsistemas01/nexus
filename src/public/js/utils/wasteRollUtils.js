import { getWasteWeightCaptureValidationError } from './warehouseInventoryUtils.js';
import { roundTo } from './formatUtils.js';

export const LENGTH_SOURCES = Object.freeze({ MEASURED: 'MEASURED', ESTIMATED: 'ESTIMATED' });

export const getRollReferenceValidationError = (value, data, field) => getWasteWeightCaptureValidationError(value, {
    fieldName: field === 'referenceConeWeightKg' ? 'coneWeightKg' : 'totalWeightKg',
    coneWeightKg: field === 'referenceConeWeightKg' ? value : data.referenceConeWeightKg,
    totalWeightKg: field === 'referenceRollTotalWeightKg' ? value : data.referenceRollTotalWeightKg,
    requireTotal: false
});

export const calculateWasteRollLength = ({ netWeightKg, referenceNetWeightKg, referenceLengthM, referenceWidthM, widthM }) => {
    if (![netWeightKg, referenceNetWeightKg, referenceLengthM, referenceWidthM, widthM].every(value => Number(value) > 0)) return null;
    return roundTo(Number(netWeightKg) * Number(referenceLengthM) * Number(referenceWidthM) / (Number(referenceNetWeightKg) * Number(widthM)));
};
