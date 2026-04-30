import { validateDate, validateGoodsIssueDetailsArray, validateProjectNumber, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

export const goodsIssueValidation = [
    validateUUID('advisorId'),
    validateUUID('clientId'),
    validateUUID('departmentId'),
    validateUUID('requesterId'),
    validateProjectNumber('projectNumber'),
    validateDate('requestDate'),
    validateTextOptional('observations'),
    validateGoodsIssueDetailsArray
];
