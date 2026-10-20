import { FORM_FIELD_LIMITS } from '../../shared/constants/inputValidation.js';
import { validateDate, validateProjectNumber, validateTextOptional, validateUUID } from '../fields/fieldsValidator.js';

export const issueHeaderValidation = [
    validateUUID('advisorId'),
    validateUUID('clientId'),
    validateUUID('departmentId'),
    validateUUID('requesterId'),
    validateProjectNumber('projectNumber'),
    validateDate('requestDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: FORM_FIELD_LIMITS.OBSERVATIONS })
];
