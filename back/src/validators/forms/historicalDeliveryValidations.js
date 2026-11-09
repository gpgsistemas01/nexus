import { body } from 'express-validator';
import { validateText, validateUUID } from '../fields/fieldsValidator.js';
import { HISTORICAL_DELIVERY_LIMITS as limits, HISTORICAL_DELIVERY_REVISION_PATTERN,
    HISTORICAL_DELIVERY_ERROR_CODES as codes } from '../../shared/constants/historicalDelivery.js';

export const historicalDeliveryValidation = [
    validateUUID('operationId'),
    validateText({ fieldName: 'reason', maxLength: limits.maxReasonLength }),
    body('declaredDelivered').custom(value => value === true).withMessage(codes.VALIDATION),
    body('documents').isArray({ min: 1, max: limits.maxDocuments }).withMessage(codes.VALIDATION),
    body('documents.*.id').isUUID('4').withMessage(codes.VALIDATION),
    body('documents.*.revision').isString().bail().matches(HISTORICAL_DELIVERY_REVISION_PATTERN).withMessage(codes.VALIDATION),
    body('cutoffDate').isISO8601({ strict: true, strictSeparator: true }).withMessage(codes.VALIDATION),
    body('deliveredAt').optional({ values: 'falsy' }).isISO8601({ strict: true, strictSeparator: true }).withMessage(codes.VALIDATION)
];
