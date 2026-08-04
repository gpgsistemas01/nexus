import { validateBoolean, validateNumberOptional, validateNumberOptionalWhen, validatePositiveNumberOptional, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateTextOptional, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";

export const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

const requiresMaxUnitCost = (body = {}) => !isGoodsReceiptMaterialCreation(body);

export const materialValidation = [
    validateText({ fieldName: 'name', maxLength: 200 }),
    validateUUID('supplierId'),
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateNumberWhen({ fieldName: 'maxUnitCost', predicate: requiresMaxUnitCost }),
    validateNumberOptionalWhen({ fieldName: 'maxUnitCost', predicate: isGoodsReceiptMaterialCreation }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height'),
    validateBoolean('isActive')
]

export const materialStockValidation = [
    validateUUID('supplierId'),
    validateNumberWhen({ fieldName: 'newStock', predicate: () => true }),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateUUIDWhen({ fieldName: 'reasonId', predicate: () => true }),
]
