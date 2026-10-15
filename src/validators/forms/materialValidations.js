import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import { validatePositiveNumberOptional, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

const materialRollReferenceValidation = ['referenceConeWeightKg', 'referenceRollTotalWeightKg'].map(fieldName =>
    body(fieldName).not().exists({ values: 'undefined' }).withMessage(errorMap.materialRollReference.READ_ONLY)
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

export const consumableValidation = [
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    ...materialEditValidation,
    ...materialStockDataValidation
];

export const materialValidation = [
    ...consumableValidation,
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height')
];
