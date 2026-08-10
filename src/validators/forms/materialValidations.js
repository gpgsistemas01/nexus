import { validateBoolean, validateNumberOptional, validateNumberOptionalWhen, validatePositiveNumberOptional, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateTextOptional, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";

export const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

export const materialEditValidation = [
    validateText({ fieldName: 'name', maxLength: 200 }),
    validateUUID('supplierId'),
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateNumberWhen({ fieldName: 'maxUnitCost', predicate: (body) => !isGoodsReceiptMaterialCreation(body) }),
    validateNumberOptionalWhen({ fieldName: 'maxUnitCost', predicate: isGoodsReceiptMaterialCreation }),
    validateBoolean('isActive')
];

const materialStockDataValidation = [
    validateNumberWhen({ fieldName: 'newStock', predicate: (body) => !isGoodsReceiptMaterialCreation(body) }),
    validateNumberOptionalWhen({ fieldName: 'newStock', predicate: isGoodsReceiptMaterialCreation }),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 })
];

export const materialStockValidation = [
    validateUUID('supplierId'),
    ...materialStockDataValidation,
    validateUUIDWhen({ fieldName: 'reasonId', predicate: () => true }),
];

export const materialValidation = [
    validateUUID('supplierId'),
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    ...materialEditValidation,
    ...materialStockDataValidation
];
