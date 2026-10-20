import { validationResult } from 'express-validator';
import { errorMap } from '../messages/codeMessages.js';

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const isObject = (value) => typeof value === 'object' && value !== null;
const isErrorCodeObject = (error) => isObject(error) && hasOwn(error, 'code');
const hasErrorCode = (error) => Boolean(error?.code);

const normalizeValidationError = (error) => {

    if (Array.isArray(error)) return error.map(normalizeValidationError);

    if (isErrorCodeObject(error)) return hasErrorCode(error) ? error : null;

    if (isObject(error)) {

        const result = {};

        for (const key in error) {
            result[key] = normalizeValidationError(error[key]);
        }

        return result;
    }

    return error ? { code: error } : null;
}

export const validate = (req, res, next) => {

    const errorsArray = validationResult(req).array();

    if (errorsArray.length > 0) {

        const errors = {};
        
        errorsArray.forEach(error => {

            if (error.path === 'details' && isObject(error.msg)
                && !Array.isArray(error.msg) && !isErrorCodeObject(error.msg)) {
                Object.assign(errors, normalizeValidationError(error.msg));
                return;
            }
            
            errors[error.path] = normalizeValidationError(error.msg);
        });

        return res.status(400).json({ errors, code: errorMap.message.VALIDATION_ERROR });
    }

    next();
}
