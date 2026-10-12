import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { validateName, validateNonNegativeNumber, validatePositiveNumber, validatePositiveNumberOptional, validateUUID } from '../fields/fieldsValidator.js';
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

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
    body('weightKg').not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.READ_ONLY),
    validateName({ maxLength: 200 }),
    ...wasteSecondaryDataValidation
];

export const wasteValidation = [
    validatePositiveNumberOptional('weightKg'),
    validateName({ maxLength: 200 }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumber('base'),
    validatePositiveNumber('height'),
    ...wasteSecondaryDataValidation,
    ...wasteStockDataValidation
];
