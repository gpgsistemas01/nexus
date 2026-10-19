import { body } from "express-validator";
import { DECIMAL_INPUT_FORMAT, FORM_FIELD_LIMITS, MONEY_INPUT_FORMAT } from '../../public/js/constants/inputValidation.js';
import { errorMap } from "../../messages/codeMessages.js";
import {
    validateBoolean,
    validateDate,
    validateInvoice,
    validatePositiveNumber,
    validateTextOptional,
    validateUUID
} from "../fields/fieldsValidator.js";

const validateGoodsReceiptDetails = details => {
    details.forEach(detail => {
        if (!detail || typeof detail !== 'object' || Array.isArray(detail)
            || !detail.materialId || detail.quantity == null || detail.quantity === ''
            || detail.costPerUnitType == null || detail.costPerUnitType === '') {
            throw new Error(errorMap['details'].INVALID_FORMAT_REQUIRED);
        }

        const qty = typeof detail.quantity === 'number' || typeof detail.quantity === 'string'
            ? Number(detail.quantity) : NaN;
        const costPerUnitType = typeof detail.costPerUnitType === 'number' || typeof detail.costPerUnitType === 'string'
            ? Number(detail.costPerUnitType) : NaN;

        if (!Number.isFinite(qty) || qty < 1 || !DECIMAL_INPUT_FORMAT.pattern.test(String(detail.quantity))) {
            throw new Error(errorMap.details.INVALID_FORMAT_QUANTITY);
        }
        if (!Number.isFinite(costPerUnitType) || costPerUnitType <= 0 || !MONEY_INPUT_FORMAT.pattern.test(String(detail.costPerUnitType))) {
            throw new Error(errorMap.details.INVALID_FORMAT_COST_PER_UNIT_TYPE);
        }
    });

    return true;
};

const createGoodsReceiptDetailsValidation = ({ optional = false } = {}) => {
    const chain = body('details');
    if (optional) chain.optional({ values: 'undefined' });

    return chain
        .isArray({ min: 1 }).withMessage(errorMap.details.REQUIRED)
        .bail()
        .custom(validateGoodsReceiptDetails).bail()
        .customSanitizer(details => details.map(detail => ({
            ...detail, quantity: Number(detail.quantity), costPerUnitType: Number(detail.costPerUnitType)
        })));
};

const goodsReceiptDataValidation = [
    validateUUID('supplierId'),
    validateUUID('receivedById'),
    validateBoolean('isInvoiced'),
    validateInvoice(),
    validateDate('receptionDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: FORM_FIELD_LIMITS.OBSERVATIONS }),
    body('details.*.materialId')
        .isString().withMessage(errorMap.details.INVALID_FORMAT_REQUIRED).bail()
        .isUUID('4').withMessage(errorMap.details.INVALID_FORMAT_REQUIRED)
];


export const goodsReceiptValidation = [
    ...goodsReceiptDataValidation,
    createGoodsReceiptDetailsValidation()
];

export const goodsReceiptHeaderValidation = [
    ...goodsReceiptDataValidation,
    createGoodsReceiptDetailsValidation({ optional: true })
];

export const goodsReceiptCorrectionValidation = [
    validatePositiveNumber('quantity'),
    validatePositiveNumber('costPerUnitType', { format: MONEY_INPUT_FORMAT })
];
