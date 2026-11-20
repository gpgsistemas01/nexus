import { body } from 'express-validator';
import { FORM_FIELD_LIMITS, MONEY_INPUT_FORMAT } from '../../shared/constants/inputValidation.js';
import { MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT } from '../../shared/constants/inventory.js';
import { errorMap } from '../../messages/codeMessages.js';
import {
    validatePositiveNumberOptional,
    validatePositiveNumber,
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

const isGoodsReceiptMaterialCreation = (body = {}) =>
    body.materialId === undefined && body.creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;

export const materialEditValidation = [
    ...materialRollReferenceValidation,
    validateText({ fieldName: 'name', maxLength: FORM_FIELD_LIMITS.MATERIAL_NAME,
        condition: (_, { req }) => req.body.name !== undefined }),
    validateUUID('supplierId'),
    ...createInventoryStateValidation(),
    validatePositiveNumber('maxUnitCost', { format: MONEY_INPUT_FORMAT }),
    validateRecordVersion(),
    validateRecordVersion('expectedMaterialVersion').optional()
];

export const materialStockValidation = [
    validateUUID('supplierId'),
    validateNumber('newStock'),
    createInventoryObservationsValidation(),
    validateUUID('reasonId'),
    validateRecordVersion()
];

const isNewIdentity = (_, { req }) => req.body.materialId === undefined;
const isSelectedIdentity = (_, { req }) => req.body.materialId !== undefined;

export const materialValidation = [
    ...materialRollReferenceValidation,
    validateText({ fieldName: 'name', maxLength: FORM_FIELD_LIMITS.MATERIAL_NAME, condition: isNewIdentity }),
    validateUUID('presentationId', { condition: isNewIdentity }),
    validateUUID('unitMeasureId', { condition: isNewIdentity }),
    validateUUID('materialId', { condition: isSelectedIdentity }),
    validateUUID('supplierId'),
    ...createInventoryStateValidation(),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'base', pairedFieldName: 'height', condition: isNewIdentity }),
    validateNumberRequiredWhenOtherPresent({ fieldName: 'height', pairedFieldName: 'base', condition: isNewIdentity }),
    validatePositiveNumberOptional('base', { condition: isNewIdentity }),
    validatePositiveNumberOptional('height', { condition: isNewIdentity }),
    validateNumber('maxUnitCost', { format: MONEY_INPUT_FORMAT, condition: (_, { req }) => !isGoodsReceiptMaterialCreation(req.body) }),
    validateNumber('newStock', { condition: (_, { req }) => !isGoodsReceiptMaterialCreation(req.body) }),
    createInventoryObservationsValidation()
];
