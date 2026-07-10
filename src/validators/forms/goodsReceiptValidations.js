import { body } from "express-validator";
import { validateBoolean, validateDate, validateDetailsArray, validateGoodsIssueReturns, validateInvoice, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

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
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];

export const goodsReceiptReturnValidation = [
    validateGoodsIssueReturns
];


export const goodsReceiptCorrectionValidation = [
    validateUUID('detailId'),
    validateUUID('productId'),
    validateUUID('reasonId'),
    body('quantity').isFloat({ gt: 0 }).withMessage('QUANTITY_INVALID_NUMBER').toFloat(),
    body('costPerUnitType').isFloat({ gt: 0 }).withMessage('COST_PER_UNIT_INVALID_NUMBER').toFloat(),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];
