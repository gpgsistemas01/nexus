import { validateDate, validateDetailsArray, validateReferenceNumber, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

export const goodsIssueValidation = [
    validateUUID('advisorId'),
    validateUUID('clientId'),
    validateUUID('departmentId'),
    validateUUID('requesterId'),
    validateReferenceNumber('referenceNumber'),
    validateDate('requestDate'),
    validateTextOptional('observations'),
    validateDetailsArray
];
