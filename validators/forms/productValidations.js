import { validateBoolean, validateNumber, validateNumberOptional, validateNumberWhen, validateText, validateTextOptional, validateTextOptionalWhen, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";

const stockAdjustmentFields = ['newStock', 'reasonId', 'observations'];
export const PRODUCT_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const hasStockAdjustmentPayload = (body = {}) =>
    stockAdjustmentFields.some(field => Object.prototype.hasOwnProperty.call(body, field));

export const isGoodsReceiptProductCreation = (body = {}) =>
    body.creationContext === PRODUCT_CREATION_CONTEXT_GOODS_RECEIPT;

export const requiresInitialStockAdjustmentOnCreate = (body = {}) =>
    !isGoodsReceiptProductCreation(body) || hasStockAdjustmentPayload(body);

const validateStockAdjustmentOnCreate = [
    validateNumberWhen('newStock', requiresInitialStockAdjustmentOnCreate),
    validateTextOptionalWhen({
        fieldName: 'observations',
        maxLength: 500,
        predicate: requiresInitialStockAdjustmentOnCreate
    }),
    validateUUIDWhen('reasonId', requiresInitialStockAdjustmentOnCreate)
];

export const productValidation = [
    validateText({ fieldName: 'name', maxLength: 200 }),
    validateUUID('supplierId'),
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    validateNumberOptional('minStock', { disableTooLong: true }),
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