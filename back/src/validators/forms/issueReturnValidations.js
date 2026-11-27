import { body } from 'express-validator';
import { UNVERIFIED_ISSUE_RETURN_SOURCE } from '../../constants/inventory.js';
import { FORM_FIELD_LIMITS, UUID_V4_PATTERN } from '../../shared/constants/inputValidation.js';
import { validatePositiveNumber, validateTextOptional } from '../fields/fieldsValidator.js';

export const issueReturnValidation = [
    validatePositiveNumber('returnQuantity'),
    validateTextOptional({ fieldName: 'observations', maxLength: FORM_FIELD_LIMITS.OBSERVATIONS }),
    body('sourceMovementDetailId').optional()
        .custom(value => typeof value === 'string' && (value === UNVERIFIED_ISSUE_RETURN_SOURCE || UUID_V4_PATTERN.test(value)))
        .withMessage('ISSUE_RETURN_COST_SOURCE_INVALID').bail()
        .customSanitizer(value => value.toLowerCase())
];
