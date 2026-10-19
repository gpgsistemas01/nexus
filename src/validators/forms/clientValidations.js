import { FORM_FIELD_LIMITS } from '../../public/js/constants/inputValidation.js';
import { validateBoolean, validateText } from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';

export const clientValidation = [
    validateText({ fieldName: 'name', maxLength: FORM_FIELD_LIMITS.CLIENT_NAME }),
    validateBoolean('isActive')
];

export const clientEditValidation = [
    ...clientValidation,
    validateRecordVersion()
];
