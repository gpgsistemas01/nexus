import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { LENGTH_SOURCES } from '../../public/js/utils/wasteRollUtils.js';
import { calculateWasteNetWeight, getWasteWeightCaptureValidationError } from '../../public/js/utils/warehouseInventoryUtils.js';
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
    ...['weightKg', 'coneWeightKg', 'totalWeightKg', 'referenceConeWeightKg', 'referenceConeWeightMode', 'coneWeightSource', 'lengthSource', 'referenceNetWeightKg', 'referenceLengthM', 'referenceWidthM', 'sourceMaterialId'].map(field => body(field).not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.READ_ONLY)),
    validateName({ maxLength: 200 }),
    ...wasteSecondaryDataValidation
];

export const wasteValidation = [
    body('useConeReference').optional().isBoolean().withMessage(errorMap.useConeReference.INVALID).toBoolean(),
    body('lengthSource').optional().isIn(Object.values(LENGTH_SOURCES)).withMessage(errorMap.lengthSource.INVALID).bail().custom((value, { req }) => {
        if (value === LENGTH_SOURCES.ESTIMATED && calculateWasteNetWeight(req.body) == null) throw new Error(errorMap.lengthSource.WEIGHTS_REQUIRED);
        return true;
    }),
    body('weightKg').not().exists({ values: 'undefined' }).withMessage(errorMap.weightKg.CALCULATED),
    ...['coneWeightKg', 'totalWeightKg'].map(fieldName => body(fieldName).custom((value, { req }) => {
        const error = getWasteWeightCaptureValidationError(value, { ...req.body, fieldName });
        if (error) throw new Error(error);

        return true;
    })),
    validateName({ maxLength: 200 }),
    validateUUID('materialId'),
    validateUUID('supplierId'),
    validatePositiveNumber('base'),
    validatePositiveNumber('height'),
    ...wasteSecondaryDataValidation,
    ...wasteStockDataValidation
];
