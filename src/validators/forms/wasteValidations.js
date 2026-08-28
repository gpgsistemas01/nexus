import { validateName, validateNonNegativeNumber, validatePositiveNumber, validateUUID } from '../fields/fieldsValidator.js';
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

const wasteStockDataValidation = [
    validateNonNegativeNumber('newStock'),
    createInventoryObservationsValidation()
];

export const wasteStockValidation = [
    ...wasteStockDataValidation,
    validateUUID('reasonId')
];

const wasteSecondaryDataValidation = [
    ...createInventoryStateValidation(),
    validateNonNegativeNumber('maxUnitCost')
];

export const wasteEditValidation = [
    validateName({ maxLength: 200 }),
    ...wasteSecondaryDataValidation
];

export const wasteValidation = [
    validateName({ maxLength: 200 }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumber('base'),
    validatePositiveNumber('height'),
    ...wasteSecondaryDataValidation,
    ...wasteStockDataValidation
];
