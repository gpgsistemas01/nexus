import { FORM_FIELD_LIMITS } from '../../shared/constants/inputValidation.js';
import { body } from "express-validator";
import { errorMap } from "../../messages/codeMessages.js";
import { validateName } from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';

export const personValidation = [
    validateName({ fieldName: 'fullName', maxLength: FORM_FIELD_LIMITS.PERSON_NAME }),
    body('accesses')
        .isArray({ min: 1 }).withMessage(errorMap.personAccesses.REQUIRED)
        .bail()
        .custom(accesses => accesses.every(access => access && typeof access === 'object' && !Array.isArray(access)))
        .withMessage(errorMap.personAccesses.INVALID_FORMAT).bail()
        .custom(accesses => new Set(accesses.map(access => typeof access.departmentId === 'string' ? access.departmentId.toLowerCase() : access.departmentId)).size === accesses.length)
        .withMessage(errorMap.personAccesses.DUPLICATE_DEPARTMENT),
    body('accesses.*.departmentId')
        .isString().withMessage(errorMap.personAccesses.INVALID_DEPARTMENT).bail()
        .isUUID('4').withMessage(errorMap.personAccesses.INVALID_DEPARTMENT),
    body('accesses.*.roleId')
        .isString().withMessage(errorMap.personAccesses.INVALID_ROLE).bail()
        .isUUID('4').withMessage(errorMap.personAccesses.INVALID_ROLE)
];

export const personEditValidation = [
    ...personValidation,
    validateRecordVersion()
];
