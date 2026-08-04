import { validateNumber, validateNumberRequiredWhenOtherPresent, validatePositiveNumberOptional, validateTextOptional, validateUUID } from '../fields/fieldsValidator.js';

const wasteDataValidation = [
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

const wasteStockAdjustmentValidationFields = [
    ...wasteStockValidationFields,
    validateUUID('reasonId')
];

export const wasteValidation = [
    ...wasteDataValidation,
    ...wasteStockValidationFields
];

export const wasteUpdateValidation = wasteDataValidation;

export const wasteStockValidation = wasteStockAdjustmentValidationFields;
