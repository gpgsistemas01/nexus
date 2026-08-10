import { validateBoolean, validateNumber, validateNumberOptional, validateNumberRequiredWhenOtherPresent, validatePositiveNumberOptional, validateTextOptional, validateUUID } from '../fields/fieldsValidator.js';

const wasteStockDataValidation = [
    validateNumber('newStock'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];

export const wasteStockValidation = [
    ...wasteStockDataValidation,
    validateUUID('reasonId')
];

export const wasteEditValidation = [
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateBoolean('isActive')
];

export const wasteValidation = [
    validateUUID('supplierMaterialId'),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    ...wasteEditValidation,
    ...wasteStockDataValidation
];
