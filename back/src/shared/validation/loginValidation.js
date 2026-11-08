import { AUTH_FIELD_LIMITS } from '../constants/auth.js';
import { isEmptyOrNull, isString, isLengthInRangeMax } from './baseValidations.js';

// Reglas públicas de captura utilizadas por Vue; Express valida el acceso.
export const loginValidation = {
    name: value => isEmptyOrNull(value, 'El nombre de usuario')
        || isString(value, 'El nombre de usuario')
        || isLengthInRangeMax(value.trim(), AUTH_FIELD_LIMITS.USERNAME_MAX_LENGTH, 'El nombre de usuario'),
    password: value => isEmptyOrNull(value, 'La contraseña')
        || isString(value, 'La contraseña')
        || isLengthInRangeMax(value, AUTH_FIELD_LIMITS.PASSWORD_MAX_LENGTH, 'La contraseña')
};
