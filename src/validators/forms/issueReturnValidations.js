import { FORM_FIELD_LIMITS } from '../../shared/constants/inputValidation.js';
import { validatePositiveNumber, validateTextOptional } from '../fields/fieldsValidator.js';

export const issueReturnValidation = [
    validatePositiveNumber('returnQuantity'),
    validateTextOptional({ fieldName: 'observations', maxLength: FORM_FIELD_LIMITS.OBSERVATIONS })
];
