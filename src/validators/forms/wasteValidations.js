import { validateNonNegativeNumber, validateNumberOptional, validatePositiveNumber, validateUUID } from '../fields/fieldsValidator.js';
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

const wasteStockDataValidation = [
    validateNonNegativeNumber('newStock'),
    createInventoryObservationsValidation()
];

export const wasteStockValidation = [
    ...wasteStockDataValidation,
    validateUUID('reasonId')
];

export const wasteEditValidation = [
    ...createInventoryStateValidation(),
    validateNumberOptional('maxUnitCost')
];

export const wasteValidation = [
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumber('base'),
    validatePositiveNumber('height'),
    ...wasteEditValidation,
    ...wasteStockDataValidation
];
