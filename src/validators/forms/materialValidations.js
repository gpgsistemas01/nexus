import { validateBoolean, validateNumberOptional, validateNumberOptionalWhen, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateTextOptional, validateTextOptionalWhen, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";

const stockAdjustmentFields = ['newStock', 'reasonId', 'observations'];
export const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const hasStockAdjustmentPayload = (body = {}) =>
    stockAdjustmentFields.some(field => Object.prototype.hasOwnProperty.call(body, field));

export const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

export const requiresInitialStockAdjustmentOnCreate = (body = {}) =>
    !isGoodsReceiptMaterialCreation(body) || hasStockAdjustmentPayload(body);

const requiresMaxUnitCost = (body = {}) => !isGoodsReceiptMaterialCreation(body);

const validateStockAdjustmentOnCreate = [
    validateNumberWhen({
        fieldName: 'newStock',
        predicate: requiresInitialStockAdjustmentOnCreate
    }),
    validateTextOptionalWhen({
        fieldName: 'observations',
        maxLength: 500,
        predicate: requiresInitialStockAdjustmentOnCreate
    })
];

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
    validateNumberOptional('base'),
    validateNumberOptional('height'),
    validateBoolean('isActive')
]

export const materialCreateValidation = [
    ...materialValidation,
    ...validateStockAdjustmentOnCreate
];

export const materialStockValidation = [
    validateUUID('supplierId'),
    validateNumberWhen({ fieldName: 'newStock', predicate: () => true }),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateUUIDWhen({ fieldName: 'reasonId', predicate: () => true }),
]
