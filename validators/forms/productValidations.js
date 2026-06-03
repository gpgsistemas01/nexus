import { validateBoolean, validateNumber, validateNumberOptional, validateNumberWhen, validateText, validateTextOptional, validateTextOptionalWhen, validateUUID, validateUUIDWhen } from "../fields/fieldsValidator.js";

const stockAdjustmentFields = ['newStock', 'reasonId', 'observations'];

export const hasStockAdjustmentPayload = (body = {}) =>
    stockAdjustmentFields.some(field => Object.prototype.hasOwnProperty.call(body, field));

const validateStockAdjustmentOnCreate = [
    validateNumberWhen('newStock', hasStockAdjustmentPayload),
    validateTextOptionalWhen({
        fieldName: 'observations',
        maxLength: 500,
        predicate: hasStockAdjustmentPayload
    }),
    validateUUIDWhen('reasonId', hasStockAdjustmentPayload)
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