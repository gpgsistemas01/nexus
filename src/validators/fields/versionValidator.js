import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';

export const validateRecordVersion = (field = 'expectedVersion') => body(field)
    .custom(value => typeof value === 'number' || typeof value === 'string')
    .withMessage(errorMap.expectedVersion.INVALID).bail()
    .isInt({ min: 0, max: 2147483647 }).withMessage(errorMap.expectedVersion.INVALID)
    .toInt();
