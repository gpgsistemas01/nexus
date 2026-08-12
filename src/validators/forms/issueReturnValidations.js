import { validatePositiveNumber, validateTextOptional } from '../fields/fieldsValidator.js';

export const issueReturnValidation = [
    validatePositiveNumber('returnQuantity'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];
