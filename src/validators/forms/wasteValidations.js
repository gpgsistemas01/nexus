import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { validateWeightCapture, validateName, validateNonNegativeNumber, validatePositiveNumber, validatePositiveNumberOptional, validatePositiveNumberWhen, validateUUID } from '../fields/fieldsValidator.js';
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';
import { WASTE_SAMPLE_FIELDS } from '../../public/js/constants/inventory.js';

const hasSampleCapture = data => ['coneWeightKg', 'totalWeightKg', ...WASTE_SAMPLE_FIELDS]
    .some(field => data[field] !== undefined && data[field] !== null && data[field] !== '');

const wasteStockDataValidation = [
    validateNonNegativeNumber('newStock'),
    createInventoryObservationsValidation()
];

export const wasteStockValidation = [
    ...wasteStockDataValidation,
    validateUUID('reasonId')
];

export const wasteStockAdditionValidation = [
    validatePositiveNumber('quantity'),
    createInventoryObservationsValidation()
];

const wasteSecondaryDataValidation = [
    ...createInventoryStateValidation(),
    validateNonNegativeNumber('maxUnitCost')
];

export const wasteEditValidation = [
    ...['weightKg', 'coneWeightKg', 'totalWeightKg', ...WASTE_SAMPLE_FIELDS, 'sourceMaterialId'].map(field => body(field).not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.READ_ONLY)),
    validateName({ maxLength: 200 }),
    ...wasteSecondaryDataValidation
];

export const wasteValidation = [
    body('weightKg').not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.CALCULATED),
    ...['coneWeightKg', 'totalWeightKg'].map(fieldName => validateWeightCapture({ fieldName })),
    ...WASTE_SAMPLE_FIELDS.map(fieldName => validatePositiveNumberWhen({ fieldName, predicate: hasSampleCapture })),
    validateName({ maxLength: 200 }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    ...wasteSecondaryDataValidation,
    ...wasteStockDataValidation
];
