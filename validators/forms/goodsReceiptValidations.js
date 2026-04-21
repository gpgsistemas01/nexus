import { validateDate, validateDetailsArray, validateTextOptional, validateUUID } from "../fields/fieldsValidator.js";

export const goodsReceiptValidation = [
    validateUUID('supplierId'),
    validateUUID('receivedById'),
    validateDate('receptionDate'),
    validateTextOptional('observations'),
    validateDetailsArray
]
