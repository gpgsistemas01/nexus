import { validateNumberOptionalWhen, validatePositiveNumberOptional, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

export const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

export const materialEditValidation = [
    validateText({ fieldName: 'name', maxLength: 200 }),
    validateUUID('supplierId'),
    ...createInventoryStateValidation(),
    validateNumberWhen({ fieldName: 'maxUnitCost', predicate: (body) => !isGoodsReceiptMaterialCreation(body) }),
    validateNumberOptionalWhen({ fieldName: 'maxUnitCost', predicate: isGoodsReceiptMaterialCreation }),
];

const materialStockDataValidation = [
    validateNumberWhen({ fieldName: 'newStock', predicate: (body) => !isGoodsReceiptMaterialCreation(body) }),
    validateNumberOptionalWhen({ fieldName: 'newStock', predicate: isGoodsReceiptMaterialCreation }),
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
