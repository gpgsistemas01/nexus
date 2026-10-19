import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { AUTH_FIELD_LIMITS } from '../../public/js/constants/auth.js';
import { validatePassword, validateUsername } from "../fields/fieldsValidator.js";

export const loginValidation = [
    body('name')
        .exists({ values: 'null' }).withMessage(errorMap.username.REQUIRED).bail()
        .isString().withMessage(errorMap.username.INVALID_TYPE).bail()
        .trim()
        .notEmpty().withMessage(errorMap.username.REQUIRED).bail()
        .isLength({ max: AUTH_FIELD_LIMITS.USERNAME_MAX_LENGTH }).withMessage(errorMap.username.TOO_LONG),
    body('password')
        .exists({ values: 'null' }).withMessage(errorMap.password.REQUIRED).bail()
        .isString().withMessage(errorMap.password.INVALID_TYPE).bail()
        .notEmpty({ ignore_whitespace: true }).withMessage(errorMap.password.REQUIRED).bail()
        .isLength({ max: AUTH_FIELD_LIMITS.PASSWORD_MAX_LENGTH }).withMessage(errorMap.password.TOO_LONG)
];

export const authRegisterValidation = [
    validateUsername,
    validatePassword,
];
