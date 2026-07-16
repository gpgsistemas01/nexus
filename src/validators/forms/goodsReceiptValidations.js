import { body } from "express-validator";
import { errorMap } from "../../messages/codeMessages.js";
import { validateBoolean, validateDate, validateDetailsArray, validateGoodsIssueReturns, validateInvoice, validatePositiveNumber, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

const validateOptionalGoodsReceiptDetails = body('details')
    .optional({ values: 'undefined' })
    .isArray().withMessage(errorMap['details'].REQUIRED)
    .custom(details => {

        details.forEach(detail => {

            if (!detail.productId || !detail.quantity || !detail.costPerUnitType) {
                throw new Error(errorMap['details'].INVALID_FORMAT_REQUIRED);
            }

            const qty = Number(detail.quantity);
            const costPerUnitType = Number(detail.costPerUnitType);

            if (!Number.isFinite(qty) || qty < 1) throw new Error(errorMap['details'].INVALID_FORMAT_QUANTITY);
            if (!Number.isFinite(costPerUnitType) || costPerUnitType <= 0) throw new Error(errorMap['details'].INVALID_FORMAT_UNIT_COST_BY_QUANTITY);
        });

        return true;
    });

export const goodsReceiptValidation = [
    validateUUID('supplierId'),
    validateUUID('receivedById'),
    validateBoolean('isInvoiced'),
    validateInvoice(),
    validateDate('receptionDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateDetailsArray
]


export const goodsReceiptHeaderValidation = [
    validateUUID('receivedById'),
    validateBoolean('isInvoiced'),
    validateInvoice(),
    validateDate('receptionDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateOptionalGoodsReceiptDetails
];

export const goodsReceiptReturnValidation = [
    validateGoodsIssueReturns
];


export const goodsReceiptCorrectionValidation = [
    validatePositiveNumber('quantity'),
    validatePositiveNumber('costPerUnitType')
];
