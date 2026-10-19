import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import {
    validateWeightCapture,
    validateName,
    validateNonNegativeNumber,
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
} from '../../public/js/constants/inventory.js';

const hasRollWeightCapture = data => WASTE_ROLL_WEIGHT_FIELDS
    .some(field => data[field] !== undefined && data[field] !== null && data[field] !== '');

export const wasteStockAdjustmentValidation = [
    validateNonNegativeNumber('newStock'),
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
    validateNonNegativeNumber('maxUnitCost')
];

export const wasteEditValidation = [
    ...WASTE_IMMUTABLE_FIELDS.map(field => body(field).not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.READ_ONLY)),
    validateName({ maxLength: 200 }),
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
    validateName({ maxLength: 200 }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    ...wasteSecondaryDataValidation,
    validateNonNegativeNumber('initialQuantity'),
    createInventoryObservationsValidation()
];
