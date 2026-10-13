import { body, query } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { validateUUID } from '../fields/fieldsValidator.js';
import { getRollReferenceValidationError } from '../../public/js/utils/wasteRollUtils.js';

export const wasteRollReferenceQueryValidation = ['materialId', 'supplierId'].map(field => query(field).isUUID(4).withMessage(errorMap[field].INVALID_UUID));
export const wasteRollReferenceValidation = [
    validateUUID('materialId'), validateUUID('supplierId'),
    ...['coneWeightMode', 'referenceConeWeightKg', 'referenceRollTotalWeightKg'].map(field => body(field).custom((value, { req }) => {
        const error = getRollReferenceValidationError(value, req.body, field);
        if (error) throw new Error(error);
        return true;
    })),
    body('referenceRollNetWeightKg').not().exists().withMessage(errorMap.weightKg.CALCULATED)
];
