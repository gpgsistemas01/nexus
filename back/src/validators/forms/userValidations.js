import { validatePassword, validateUsername, validateUUID } from "../fields/fieldsValidator.js";
import { validateRecordVersion } from '../fields/versionValidator.js';

export const userValidation = [
    validateUsername,
    validatePassword,
    validateUUID('roleId'),
    validateUUID('departmentId')
];

export const userEditValidation = [
    validateUsername,
    validateUUID('roleId'),
    validateUUID('departmentId'),
    validateRecordVersion()
];

export const userPasswordValidation = [
    validatePassword,
    validateRecordVersion()
];
