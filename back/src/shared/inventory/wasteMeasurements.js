import { SQUARE_METER_UNIT_NAMES, SQUARE_METER_UNIT_SYMBOLS, WASTE_WEIGHT_LIMITS } from '../constants/inventory.js';
import { DECIMAL_INPUT_FORMAT } from '../constants/inputValidation.js';
import { roundTo } from '../utils/numberUtils.js';
import { getWasteWeightValidationError } from '../validation/weightValidations.js';

export const isRollPresentation = name => String(name ?? '').trim().toLocaleUpperCase('es-MX') === 'ROLLO';

export const isSquareMeterUnitMeasure = ({ name = '', symbol = '' } = {}) =>
    SQUARE_METER_UNIT_SYMBOLS.includes(symbol.trim().toUpperCase())
    || SQUARE_METER_UNIT_NAMES.includes(name.trim().toUpperCase());

export const calculateWasteNetWeight = (data, { coneFieldName = 'coneWeightKg', totalFieldName = 'totalWeightKg' } = {}) => {
    const coneWeightKg = data[coneFieldName];
    const totalWeightKg = data[totalFieldName];
    if (coneWeightKg == null || coneWeightKg === '' || totalWeightKg == null || totalWeightKg === '') return null;
    if (getWasteWeightValidationError(coneWeightKg, { allowZero: true })
        || getWasteWeightValidationError(totalWeightKg)
        || Number(totalWeightKg) <= Number(coneWeightKg)) return null;
    return roundTo(Number(totalWeightKg) - Number(coneWeightKg), WASTE_WEIGHT_LIMITS.DECIMAL_DIGITS);
};

export const calculateWasteRollLength = ({ weightKg, referenceNetWeightKg, referenceLengthM }) => {
    if (![weightKg, referenceNetWeightKg, referenceLengthM].every(value => Number.isFinite(Number(value)) && Number(value) > 0)) return null;
    const length = roundTo(Number(weightKg) * Number(referenceLengthM) / Number(referenceNetWeightKg), DECIMAL_INPUT_FORMAT.decimalDigits);
    return length > 0 ? length : null;
};

export const getMaterialLengthField = ({ base, height } = {}) => {
    if (!(Number(base) > 0 && Number(height) > 0)) return null;
    return Number(base) > Number(height) ? 'base' : 'height';
};

export const prepareWasteRollReference = ({ material }) => {
    if (!isRollPresentation(material?.presentation?.name)) return null;

    const lengthField = getMaterialLengthField(material);
    if (!lengthField) return null;

    const widthField = lengthField === 'base' ? 'height' : 'base';
    return {
        lengthField,
        widthField,
        widthM: roundTo(Number(material[widthField]), DECIMAL_INPUT_FORMAT.decimalDigits),
        lengthM: Number(material[lengthField])
    };
};
