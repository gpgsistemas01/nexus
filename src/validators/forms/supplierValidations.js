import { validateBoolean, validateText } from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';

export const supplierValidation = [
    validateText({ fieldName: 'legalName', maxLength: 200 }),
    validateText({ fieldName: 'tradeName', maxLength: 100 }),
    validateBoolean('isActive')
];

export const supplierEditValidation = [
    ...supplierValidation,
    validateRecordVersion()
];
