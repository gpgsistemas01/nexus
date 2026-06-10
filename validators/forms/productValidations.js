import { validateBoolean, validateNumber, validateNumberOptional, validateNumberRequiredWhenOtherPresent, validateNumberWhen, validateText, validateTextOptional, validateTextOptionalWhen, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";

const stockAdjustmentFields = ['newStock', 'reasonId', 'observations'];
export const PRODUCT_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const hasStockAdjustmentPayload = (body = {}) =>
    stockAdjustmentFields.some(field => Object.prototype.hasOwnProperty.call(body, field));

export const isGoodsReceiptProductCreation = (body = {}) =>
    body.creationContext === PRODUCT_CREATION_CONTEXT_GOODS_RECEIPT;

export const requiresInitialStockAdjustmentOnCreate = (body = {}) =>
    !isGoodsReceiptProductCreation(body) || hasStockAdjustmentPayload(body);

const validateStockAdjustmentOnCreate = [
    validateNumberWhen({
        fieldName: 'newStock',
        predicate: requiresInitialStockAdjustmentOnCreate
    }),
    validateTextOptionalWhen({
        fieldName: 'observations',
        maxLength: 500,
        predicate: requiresInitialStockAdjustmentOnCreate
    }),
    validateUUIDWhen({
        fieldName: 'reasonId',
        predicate: requiresInitialStockAdjustmentOnCreate
    })
];

export const productValidation = [
    validateText({ fieldName: 'name', maxLength: 200 }),
    validateUUID('supplierId'),
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validateNumberOptional('base'),
    validateNumberOptional('height'),
    validateBoolean('isActive')
]

export const productCreateValidation = [
    ...productValidation,
    ...validateStockAdjustmentOnCreate
];

export const productStockValidation = [
    validateUUID('supplierId'),
    validateNumber('newStock'),
    validateTextOptional({ fieldName: 'observations', maxLength: 500 }),
    validateUUID('reasonId'),
]