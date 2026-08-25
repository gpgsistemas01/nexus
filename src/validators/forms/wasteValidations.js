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

const wasteStateValidation = createInventoryStateValidation();

export const wasteEditValidation = [
    ...wasteStateValidation,
    validateNonNegativeNumber('maxUnitCost')
];

export const wasteValidation = [
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumber('base'),
    validatePositiveNumber('height'),
    ...wasteStateValidation,
    validateNumberOptional('maxUnitCost'),
    ...wasteStockDataValidation
];
