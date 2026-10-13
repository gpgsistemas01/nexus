import { body } from 'express-validator';
import { validatePositiveNumberOptional, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

import { getRollReferenceValidationError } from '../../public/js/utils/wasteRollUtils.js';

const materialRollReferenceValidation = ['referenceConeWeightKg', 'referenceRollTotalWeightKg'].map(field =>
    body(field).custom((value, { req }) => {
        const error = getRollReferenceValidationError(value, req.body, field);
        if (error) throw new Error(error);
        return true;
    })
);

export const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

export const materialEditValidation = [
    ...materialRollReferenceValidation,
    validateText({ fieldName: 'name', maxLength: 200 }),
    validateUUID('supplierId'),
    ...createInventoryStateValidation(),
    validateNumberWhen({ fieldName: 'maxUnitCost', predicate: (body) => !isGoodsReceiptMaterialCreation(body) }),
];

const materialStockDataValidation = [
    validateNumberWhen({ fieldName: 'newStock', predicate: (body) => !isGoodsReceiptMaterialCreation(body) }),
    createInventoryObservationsValidation()
];

export const materialStockValidation = [
    validateUUID('supplierId'),
    ...materialStockDataValidation,
    validateUUIDWhen({ fieldName: 'reasonId', predicate: () => true }),
];

export const materialValidation = [
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    ...materialEditValidation,
    ...materialStockDataValidation
];
