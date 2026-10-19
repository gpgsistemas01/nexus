import { body } from "express-validator";
import { errorMap } from "../../messages/codeMessages.js";
import {
    validateBoolean,
    validateDate,
    validateInvoice,
    validateNonNegativeNumber,
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

        if (!Number.isFinite(qty) || qty < 1) throw new Error(errorMap['details'].INVALID_FORMAT_QUANTITY);
        if (!Number.isFinite(costPerUnitType) || costPerUnitType <= 0) throw new Error(errorMap['details'].INVALID_FORMAT_COST_PER_UNIT_TYPE);
    });

    return true;
};

const validateDetailsArray = body('details')
    .isArray({ min: 1 }).withMessage(errorMap['details'].REQUIRED)
    .bail()
    .custom(validateGoodsReceiptDetails);

const validateOptionalGoodsReceiptDetails = body('details')
    .optional({ values: 'undefined' })
    .isArray({ min: 1 }).withMessage(errorMap['details'].REQUIRED)
    .bail()
    .custom(validateGoodsReceiptDetails);

export const goodsReceiptValidation = [
    validateUUID('supplierId'),
    validateUUID('receivedById'),
    validateBoolean('isInvoiced'),
    validateInvoice(),
    validateDate('receptionDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    body('details.*.materialId').isUUID('4').withMessage(errorMap.details.INVALID_FORMAT_REQUIRED),
    validateDetailsArray
];


export const goodsReceiptHeaderValidation = [
    validateUUID('supplierId'),
    validateUUID('receivedById'),
    validateBoolean('isInvoiced'),
    validateInvoice(),
    validateDate('receptionDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    body('details.*.materialId').isUUID('4').withMessage(errorMap.details.INVALID_FORMAT_REQUIRED),
    validateOptionalGoodsReceiptDetails
];


export const goodsReceiptCorrectionValidation = [
    validateNonNegativeNumber('quantity'),
    validatePositiveNumber('costPerUnitType')
];
