import { validateNumber, validateTextOptional, validateUUID } from '../fields/fieldsValidator.js';

const wasteDataValidation = [
    validateUUID('supplierProductId'),
    validateNumber('base'),
    validateNumber('height')
];

const wasteStockValidationFields = [
    validateNumber('currentStock'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateUUID('reasonId')
];

export const wasteValidation = [
    ...wasteDataValidation,
    ...wasteStockValidationFields
];

export const wasteUpdateValidation = wasteDataValidation;

export const wasteStockValidation = wasteStockValidationFields;
