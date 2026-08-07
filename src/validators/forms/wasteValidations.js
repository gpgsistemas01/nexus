import { validateBoolean, validateNumber, validateNumberOptional, validateNumberRequiredWhenOtherPresent, validatePositiveNumberOptional, validateTextOptional, validateUUID } from '../fields/fieldsValidator.js';

const newWasteDataValidation = [
    validateUUID('supplierMaterialId'),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height')
];

const wasteStockValidationFields = [
    validateNumber('currentStock'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];

export const wasteStockValidation = [
    ...wasteStockValidationFields,
    validateUUID('reasonId')
];

export const editedWasteDataValidation = [
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateBoolean('isActive')
];

export const wasteValidation = [
    ...newWasteDataValidation,
    ...editedWasteDataValidation,
    ...wasteStockValidationFields
];