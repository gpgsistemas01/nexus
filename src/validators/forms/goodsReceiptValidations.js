import { validateBoolean, validateDate, validateDetailsArray, validateGoodsIssueReturns, validateInvoice, validatePositiveNumber, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

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
    validatePositiveNumber('quantity'),
    validatePositiveNumber('costPerUnitType'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];
