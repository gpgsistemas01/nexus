import { FORM_FIELD_LIMITS } from '../../shared/constants/inputValidation.js';
import { validateBoolean, validateText } from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';

export const supplierValidation = [
    validateText({ fieldName: 'legalName', maxLength: FORM_FIELD_LIMITS.SUPPLIER_LEGAL_NAME }),
    validateText({ fieldName: 'tradeName', maxLength: FORM_FIELD_LIMITS.SUPPLIER_TRADE_NAME }),
    validateBoolean('isActive')
];

export const supplierEditValidation = [
    ...supplierValidation,
    validateRecordVersion()
];
