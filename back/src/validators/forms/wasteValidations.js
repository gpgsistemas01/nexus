import { FORM_FIELD_LIMITS, MONEY_INPUT_FORMAT } from '../../shared/constants/inputValidation.js';
import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import {
    validateWeightCapture,
    validateText,
    validateNumber,
    validatePositiveNumber,
    validatePositiveNumberOptional,
    validateUUID
} from '../fields/fieldsValidator.js';
import { validateRecordVersion } from '../fields/versionValidator.js';
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';
import {
    WASTE_IMMUTABLE_FIELDS,
    WASTE_ROLL_WEIGHT_FIELDS,
    WASTE_SAMPLE_FIELDS
} from '../../shared/constants/inventory.js';

const hasRollWeightCapture = data => WASTE_ROLL_WEIGHT_FIELDS
    .some(field => data[field] !== undefined && data[field] !== null && data[field] !== '');

export const wasteStockAdjustmentValidation = [
    validateNumber('newStock'),
    createInventoryObservationsValidation(),
    validateUUID('reasonId'),
    validateRecordVersion()
];

export const wasteStockAdditionValidation = [
    validateUUID('operationId'),
    validatePositiveNumber('quantity'),
    createInventoryObservationsValidation()
];

const wasteSecondaryDataValidation = [
    ...createInventoryStateValidation(),
    validateNumber('maxUnitCost', { format: MONEY_INPUT_FORMAT })
];

export const wasteEditValidation = [
    ...WASTE_IMMUTABLE_FIELDS.map(field => body(field).not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.READ_ONLY)),
    validateText({ fieldName: 'name', maxLength: FORM_FIELD_LIMITS.MATERIAL_NAME }),
    ...wasteSecondaryDataValidation,
    validateRecordVersion()
];

export const wasteValidation = [
    validateUUID('operationId'),
    body('weightKg').not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.CALCULATED),
    ...WASTE_SAMPLE_FIELDS.map(fieldName => body(fieldName).not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.CALCULATED)),
    ...WASTE_ROLL_WEIGHT_FIELDS.map(fieldName => validateWeightCapture({
        fieldName,
        totalFieldName: fieldName === 'referenceRollTotalWeightKg' ? fieldName : 'totalWeightKg',
        requiredWhen: hasRollWeightCapture
    })),
    validateText({ fieldName: 'name', maxLength: FORM_FIELD_LIMITS.MATERIAL_NAME }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    ...wasteSecondaryDataValidation,
    validateNumber('initialQuantity'),
    createInventoryObservationsValidation()
];
