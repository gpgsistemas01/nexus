import { body } from "express-validator";
import {
    BOOLEAN_INPUT_VALUES,
    DECIMAL_INPUT_FORMAT,
    FORM_FIELD_LIMITS,
    ISO_DATE_TIME_PATTERN,
    PERSON_NAME_PATTERN,
    TEXT_INPUT_PATTERN,
    UUID_V4_PATTERN
} from '../../shared/constants/inputValidation.js';
import { AUTH_FIELD_LIMITS } from '../../shared/constants/auth.js';
import { wasteWeightRules } from '../../shared/validation/weightValidations.js';
import { errorMap } from "../../messages/codeMessages.js";

const numberRegex = /\d/;
const UppercaseRegex = /[A-Z]/;
const whitespaceRegex = /^\S+$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const invoiceRegex = /^[a-zA-Z0-9\-]+$/;
const passwordRegex = /^[A-Za-z0-9!@#\$%\^&\*]+$/;
const nameRegex = PERSON_NAME_PATTERN;
const genericRegex = TEXT_INPUT_PATTERN;
const uuidV4Regex = UUID_V4_PATTERN;

const requireValue = (validationChain, requiredError) =>
    validationChain
        .exists({ values: 'null' }).withMessage(requiredError).bail()
        .notEmpty({ ignore_whitespace: true }).withMessage(requiredError).bail()
;

export const validateUsername =
    requireValue(body('name'), errorMap['username'].REQUIRED)
        .isString().withMessage(errorMap['username'].INVALID_TYPE).bail()
        .trim()
        .isLength({ max: AUTH_FIELD_LIMITS.USERNAME_MAX_LENGTH }).withMessage(errorMap['username'].TOO_LONG)
        .matches(whitespaceRegex).withMessage(errorMap['username'].NO_SPACES)
        .matches(usernameRegex).withMessage(errorMap['username'].INVALID_FORMAT)
;

export const validatePassword =
    requireValue(body('password'), errorMap['password'].REQUIRED)
        .isString().withMessage(errorMap['password'].INVALID_TYPE).bail()
        .isLength({ min: AUTH_FIELD_LIMITS.PASSWORD_MIN_LENGTH }).withMessage(errorMap['password'].TOO_SHORT).bail()
        .isLength({ max: AUTH_FIELD_LIMITS.PASSWORD_MAX_LENGTH }).withMessage(errorMap['password'].TOO_LONG).bail()
        .matches(UppercaseRegex).withMessage(errorMap['password'].NEEDS_UPPERCASE).bail()
        .matches(numberRegex).withMessage(errorMap['password'].NEEDS_NUMBER).bail()
        .matches(passwordRegex).withMessage(errorMap['password'].INVALID_FORMAT).bail()
;

export const validateName = ({ fieldName = 'name', maxLength = 50 }) =>
    validateText({ fieldName, maxLength, pattern: nameRegex });

export const validateInvoice = (maxLength = FORM_FIELD_LIMITS.INVOICE) =>
    requireValue(
        body('invoice').if((value, { req }) => {
            const val = req.body.isInvoiced;
            return val === true || val === 'true'
        }),
        errorMap['invoice'].REQUIRED
    )
        .isString().withMessage(errorMap['invoice'].INVALID_TYPE).bail()
        .trim()
        .isLength({ max: maxLength }).withMessage(errorMap['invoice'].TOO_LONG(maxLength))
        .matches(invoiceRegex).withMessage(errorMap['invoice'].INVALID_FORMAT)
;

export const validateText = ({
    fieldName,
    maxLength,
    optional = false,
    condition = () => true,
    pattern = genericRegex
}) => {
    const errors = optional ? errorMap[fieldName] : errorMap.name;
    const getMaxLength = typeof maxLength === 'function' ? maxLength : () => maxLength;
    let chain = body(fieldName).if(condition);

    if (optional) {
        chain = chain.customSanitizer(value => value === undefined || value === null ? '' : value);
    } else {
        chain = requireValue(chain, errors.REQUIRED);
    }

    chain = chain.isString().withMessage(errors.INVALID_TYPE).bail().trim();
    if (optional) chain = chain.if(body(fieldName).notEmpty());

    return chain
        .custom((value, { req }) => Array.from(value).length <= getMaxLength(req))
        .withMessage((_, { req }) => errors.TOO_LONG(getMaxLength(req)))
        .matches(pattern).withMessage(errors.INVALID_FORMAT);
};

export const validateTextOptional = options => validateText({ ...options, optional: true });

export const validateBoolean = (fieldName, { condition = () => true } = {}) =>
    requireValue(body(fieldName).if(condition), errorMap[fieldName].REQUIRED)
        .custom(value => BOOLEAN_INPUT_VALUES.includes(value)).withMessage(errorMap[fieldName].INVALID_BOOLEAN).bail()
        .toBoolean()
;

export const validateUUID = (fieldName) => {

    const errors = errorMap[fieldName];

    return requireValue(body(fieldName), errors.REQUIRED)
        .isString().withMessage(errors.INVALID_UUID).bail()
        .isUUID('4').withMessage(errors.INVALID_UUID)
}

export const validateProjectNumber = (fieldName) => {

    const errors = errorMap[fieldName];

    return requireValue(body(fieldName), errors.REQUIRED)
        .isString().withMessage(errors.INVALID_TYPE).bail()
        .trim()
        .isLength({ max: FORM_FIELD_LIMITS.PROJECT_NUMBER }).withMessage(errors.TOO_LONG)
}

const hasValue = value => value !== undefined && value !== null && value !== '';

const validateNumericInput = ({
    fieldName,
    optional = false,
    positive = false,
    condition = () => true,
    format = DECIMAL_INPUT_FORMAT
}) => {
    const errors = errorMap[fieldName];
    let chain = body(fieldName).if(condition);
    if (optional) chain = chain.customSanitizer(value => hasValue(value) ? value : undefined).if(hasValue);

    if (!optional) chain = requireValue(chain, errors.REQUIRED);

    return chain
        .custom(value => typeof value === 'number' || typeof value === 'string')
        .withMessage(errors.INVALID_NUMBER).bail()
        .isFloat(positive ? { gt: 0 } : { min: 0 }).withMessage(errors.INVALID_NUMBER).bail()
        .custom(value => format.pattern.test(String(value)) && format.pattern.test(String(Number(value))))
        .withMessage(errors.TOO_LONG).bail()
        .toFloat();
};

export const validateNumber = (fieldName, options = {}) => validateNumericInput({ ...options, fieldName });
export const validatePositiveNumber = (fieldName, options = {}) => validateNumericInput({ ...options, fieldName, positive: true });
export const validateNumberOptional = (fieldName, options = {}) => validateNumericInput({ ...options, fieldName, optional: true });
export const validatePositiveNumberOptional = (fieldName, options = {}) => validateNumericInput({ ...options, fieldName, optional: true, positive: true });

export const validateNumberRequiredWhenOtherPresent = ({ fieldName, pairedFieldName }) => requireValue(
    body(fieldName).if((value, { req }) => hasValue(req.body[pairedFieldName])),
    errorMap[fieldName].REQUIRED
);

export const validateDate = (fieldName) => {

    const errors = errorMap[fieldName];

    return requireValue(body(fieldName), errors.REQUIRED)
        .isString().withMessage(errors.INVALID_FORMAT).bail()
        .matches(ISO_DATE_TIME_PATTERN).withMessage(errors.INVALID_FORMAT).bail()
        .isISO8601({ strict: true }).withMessage(errors.INVALID_FORMAT).bail()
        .custom(value => !isNaN(new Date(value))).withMessage(errors.INVALID_FORMAT)
        .toDate()
}

export const validateIssueDetailsArray = ({
    allowDetailId = false,
    exclusiveMinimum = true,
    itemIdField,
    minimumQuantity = 0,
    requireSupplier = false
}) => body('details')
    .isArray({ min: 1 }).withMessage(errorMap['details'].REQUIRED)
    .bail()
    .custom(details => {

        const ids = new Set();

        details.forEach(detail => {

            if (!detail || typeof detail !== 'object' || Array.isArray(detail)) {
                throw new Error(errorMap['details'].INVALID_FORMAT_REQUIRED);
            }

            if (detail.id) {
                if (!allowDetailId || typeof detail.id !== 'string' || !uuidV4Regex.test(detail.id)) {
                    throw new Error(errorMap['details'].INVALID_FORMAT_ID);
                }

                if (ids.has(detail.id)) {
                    throw new Error(errorMap['details'].INVALID_FORMAT_ID);
                }

                ids.add(detail.id);
            }

            if (typeof detail[itemIdField] !== 'string' || !uuidV4Regex.test(detail[itemIdField])) {
                throw new Error(errorMap['details'].INVALID_FORMAT_REQUIRED);
            }

            if (requireSupplier && (typeof detail.supplierId !== 'string' || !uuidV4Regex.test(detail.supplierId))) {
                throw new Error(errorMap['details'].INVALID_FORMAT_SUPPLIER);
            }

            const quantity = typeof detail.quantity === 'number' || typeof detail.quantity === 'string'
                ? Number(detail.quantity) : NaN;
            const hasInvalidQuantity = exclusiveMinimum
                ? quantity <= minimumQuantity
                : quantity < minimumQuantity;

            if (
                detail.quantity === ''
                || detail.quantity === null
                || detail.quantity === undefined
                || !Number.isFinite(quantity)
                || hasInvalidQuantity
                || !DECIMAL_INPUT_FORMAT.pattern.test(String(detail.quantity))
            ) {
                throw new Error(errorMap['details'].INVALID_FORMAT_QUANTITY);
            }
        });

        return true;
    }).bail()
    .customSanitizer(details => details.map(detail => ({ ...detail, quantity: Number(detail.quantity) })))
;

export const validateGoodsIssueDetailsArray = ({ allowDetailId = false } = {}) =>
    validateIssueDetailsArray({
        allowDetailId,
        exclusiveMinimum: false,
        itemIdField: 'materialId',
        minimumQuantity: 1,
        requireSupplier: true
    })
;

export const validateIssueProjectQuantityDetailsEdition =
    body('details')
        .isArray({ min: 1 }).withMessage(errorMap['details'].REQUIRED)
        .bail()
        .custom((details) => {

            const errors = {};

            details.forEach((detail) => {

                const detailId = detail?.id;

                if (typeof detailId !== 'string' || !uuidV4Regex.test(detailId)) {
                    errors.details = errorMap['details'].INVALID_FORMAT_ID;
                    return;
                }

                const rawQuantity = detail?.projectConvertedQuantity;
                const quantity = typeof rawQuantity === 'number' || typeof rawQuantity === 'string'
                    ? Number(rawQuantity) : NaN;
                const isSuppliedRaw = detail?.isSupplied;
                const isSupplied = isSuppliedRaw === 'true' ? true
                    : isSuppliedRaw === 'false' ? false : isSuppliedRaw;

                if (rawQuantity === undefined || rawQuantity === null || rawQuantity === '') {

                    if (!errors[detailId]) errors[detailId] = {};

                    errors[detailId].projectConvertedQuantity = errorMap['details'].REQUIRED_QUANTITY;
                } else if (!Number.isFinite(quantity) || quantity <= 0
                    || !DECIMAL_INPUT_FORMAT.pattern.test(String(rawQuantity))) {

                    if (!errors[detailId]) errors[detailId] = {};

                    errors[detailId].projectConvertedQuantity = errorMap['details'].INVALID_FORMAT_QUANTITY;
                }

                if (isSuppliedRaw === null || isSuppliedRaw === undefined) {

                    if (!errors[detailId]) errors[detailId] = {};

                    errors[detailId].isSupplied = errorMap['isSupplied'].REQUIRED;
                } else if (typeof isSupplied !== 'boolean') {

                    if (!errors[detailId]) errors[detailId] = {};

                    errors[detailId].isSupplied = errorMap['isSupplied'].INVALID_BOOLEAN;
                }

            });

            if (Object.keys(errors).length) {
                throw errors;
            }

            return true;
        }).bail()
        .customSanitizer(details => details.map(detail => ({
            ...detail,
            projectConvertedQuantity: Number(detail.projectConvertedQuantity),
            isSupplied: detail.isSupplied === true || detail.isSupplied === 'true'
        })))
;

export const validateArrayOfUUIDs = ({ fieldName }) =>
    body(fieldName)
        .isArray({ min: 1 }).withMessage(errorMap[fieldName].REQUIRED)
        .custom(
            arr => Array.isArray(arr) && arr.every(
                id => uuidV4Regex.test(id)
            )
        ).withMessage(errorMap[fieldName].INVALID_FORMAT)
;

export const validateWeightCapture = ({
    fieldName,
    coneFieldName = 'coneWeightKg',
    totalFieldName = 'totalWeightKg',
    requireTotal = true,
    requiredWhen = () => false
}) => {
    const isCone = fieldName === coneFieldName;
    const totalErrors = errorMap[totalFieldName] ?? errorMap.totalWeightKg;

    return body(fieldName)
        .custom((value, { req }) => !requiredWhen(req.body) || hasValue(value))
        .withMessage(isCone ? errorMap.coneWeightKg.REQUIRED : totalErrors.REQUIRED).bail()
        .custom(value => wasteWeightRules.isNumber(value, { allowZero: isCone }))
        .withMessage(isCone ? errorMap.coneWeightKg.INVALID_NUMBER : errorMap.weightKg.INVALID_NUMBER).bail()
        .custom(wasteWeightRules.isWithinLimit)
        .withMessage(errorMap.weightKg.TOO_HIGH).bail()
        .custom(wasteWeightRules.hasValidPrecision)
        .withMessage(errorMap.weightKg.TOO_LONG).bail()
        .custom((value, { req }) => wasteWeightRules.hasRequiredPair(value, {
            pairedValue: req.body[isCone ? totalFieldName : coneFieldName],
            required: isCone || requireTotal
        }))
        .withMessage(isCone ? errorMap.coneWeightKg.REQUIRED : totalErrors.REQUIRED).bail()
        .custom((value, { req }) => isCone || wasteWeightRules.isTotalGreaterThanCone(value, req.body[coneFieldName]))
        .withMessage(totalErrors.NOT_GREATER).bail()
        .customSanitizer(value => value === undefined ? undefined : hasValue(value) ? Number(value) : null);
};
