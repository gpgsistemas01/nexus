import { validateBoolean, validateText } from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';

export const clientValidation = [
    validateText({ fieldName: 'name', maxLength: 255 }),
    validateBoolean('isActive')
];

export const clientEditValidation = [
    ...clientValidation,
    validateRecordVersion()
];
