import { body } from "express-validator";
import { errorMap } from "../../messages/codeMessages.js";
import { validateName } from "../fields/fieldsValidator.js";

export const personValidation = [
    validateName({ fieldName: 'fullName', maxLength: 255 }),
    body('accesses')
        .isArray({ min: 1 }).withMessage(errorMap.personAccesses.REQUIRED)
        .bail()
        .custom(accesses => new Set(accesses.map(access => access.departmentId)).size === accesses.length)
        .withMessage(errorMap.personAccesses.DUPLICATE_DEPARTMENT),
    body('accesses.*.departmentId')
        .isUUID('4').withMessage(errorMap.personAccesses.INVALID_DEPARTMENT),
    body('accesses.*.roleId')
        .isUUID('4').withMessage(errorMap.personAccesses.INVALID_ROLE)
];
