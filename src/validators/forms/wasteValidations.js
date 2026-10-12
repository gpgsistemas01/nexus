import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { getWasteWeightValidationError } from '../../public/js/utils/warehouseInventoryUtils.js';
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
    body('weightKg').custom(value => {
        const error = getWasteWeightValidationError(value);
        if (error) throw new Error(error);

        return true;
    }),
    validateName({ maxLength: 200 }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumber('base'),
    validatePositiveNumber('height'),
    ...wasteSecondaryDataValidation,
    ...wasteStockDataValidation
];
