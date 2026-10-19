import { FORM_FIELD_LIMITS, MONEY_INPUT_FORMAT } from '../../public/js/constants/inputValidation.js';
import { body } from 'express-validator';
import { errorMap } from '../../messages/codeMessages.js';
import {
    validatePositiveNumberOptional,
    validateNumberRequiredWhenOtherPresent,
    validateNumber,
    validateText,
    validateUUID
} from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';
import { createInventoryObservationsValidation, createInventoryStateValidation } from './inventoryValidations.js';

const materialRollReferenceValidation = ['referenceConeWeightKg', 'referenceRollTotalWeightKg'].map(fieldName =>
    body(fieldName).not().exists({ values: 'undefined' }).withMessage(errorMap.materialRollReference.READ_ONLY)
);

export const MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT = 'goodsReceipt';

export const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

const materialDataValidation = [
    ...materialRollReferenceValidation,
    validateText({ fieldName: 'name', maxLength: FORM_FIELD_LIMITS.MATERIAL_NAME }),
    validateUUID('supplierId'),
    ...createInventoryStateValidation()
];

export const materialEditValidation = [
    ...materialDataValidation,
    validateNumber('maxUnitCost', { format: MONEY_INPUT_FORMAT }),
    validateRecordVersion(),
    validateRecordVersion('expectedMaterialVersion')
];

export const materialStockValidation = [
    validateUUID('supplierId'),
    validateNumber('newStock'),
    createInventoryObservationsValidation(),
    validateUUID('reasonId'),
    validateRecordVersion()
];

export const consumableValidation = [
    validateUUID('presentationId'),
    validateUUID('unitMeasureId'),
    ...materialDataValidation,
    validateNumber('maxUnitCost', { format: MONEY_INPUT_FORMAT, condition: (_, { req }) => !isGoodsReceiptMaterialCreation(req.body) }),
    validateNumber('newStock', { condition: (_, { req }) => !isGoodsReceiptMaterialCreation(req.body) }),
    createInventoryObservationsValidation()
];

export const materialValidation = [
    ...consumableValidation,
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height' }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base' }),
    validatePositiveNumberOptional('base'),
    validatePositiveNumberOptional('height')
];
