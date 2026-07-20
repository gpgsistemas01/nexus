import { validateDate, validateGoodsIssueDetailsArray, validateGoodsIssueDetailsEdition, validatePositiveNumber, validateProjectNumber, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

export const goodsIssueValidation = [
    validateUUID('advisorId'),
    validateUUID('clientId'),
    validateUUID('departmentId'),
    validateUUID('requesterId'),
    validateProjectNumber('projectNumber'),
    validateDate('requestDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateGoodsIssueDetailsArray()
];

export const goodsIssueUpdateValidation = [
    validateUUID('advisorId'),
    validateUUID('clientId'),
    validateUUID('departmentId'),
    validateUUID('requesterId'),
    validateProjectNumber('projectNumber'),
    validateDate('requestDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateGoodsIssueDetailsArray({ allowDetailId: true })
];

export const goodsIssueDetailsValidation = [
    validateGoodsIssueDetailsEdition
];

export const goodsIssueHeaderValidation = [
    validateUUID('advisorId'),
    validateUUID('clientId'),
    validateUUID('departmentId'),
    validateUUID('requesterId'),
    validateProjectNumber('projectNumber'),
    validateDate('requestDate'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];


export const goodsIssueReturnValidation = [
    validatePositiveNumber('returnQuantity'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];
