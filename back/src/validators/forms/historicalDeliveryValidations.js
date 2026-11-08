import { body } from 'express-validator';
import { validateText, validateUUID } from '../fields/fieldsValidator.js';

export const historicalDeliveryValidation = [
    validateUUID('operationId'),
    validateText({ fieldName: 'reason', maxLength: 500 }),
    body('declaredDelivered').custom(value => value === true).withMessage('HISTORICAL_DELIVERY_VALIDATION'),
    body('documents').isArray({ min: 1, max: 100 }).withMessage('HISTORICAL_DELIVERY_VALIDATION'),
    body('documents.*.id').isUUID('4').withMessage('HISTORICAL_DELIVERY_VALIDATION'),
    body('documents.*.revision').isString().bail().matches(/^[a-f0-9]{64}$/).withMessage('HISTORICAL_DELIVERY_VALIDATION'),
    body('cutoffDate').isISO8601({ strict: true, strictSeparator: true }).withMessage('HISTORICAL_DELIVERY_VALIDATION'),
    body('deliveredAt').optional({ values: 'falsy' }).isISO8601({ strict: true, strictSeparator: true }).withMessage('HISTORICAL_DELIVERY_VALIDATION')
];
