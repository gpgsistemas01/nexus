import { validateNumber, validateTextOptional, validateUUID } from '../fields/fieldsValidator.js';

export const wasteValidation = [
    validateUUID('supplierId'),
    validateUUID('productId'),
    validateNumber('quantity'),
    validateNumber('base'),
    validateNumber('height'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateUUID('reasonId')
];
