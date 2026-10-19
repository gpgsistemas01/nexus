import { BOOLEAN_INPUT_VALUES, DECIMAL_INPUT_FORMAT, FORM_FIELD_LIMITS, MONEY_INPUT_FORMAT, TEXT_INPUT_PATTERN, UUID_V4_PATTERN } from '../../constants/inputValidation.js';
import { AUTH_FIELD_LIMITS } from '../../constants/auth.js';
import { getWasteWeightCaptureValidationError } from './weightValidations.js';
import { getErrorMessage } from "../../constants/apiMessages.js";
import { isRollPresentation } from "../warehouseInventoryUtils.js";
import { includeSpace, includeUppercase, isDateTime, isEmptyOrNull, isLengthInRangeMax, isLengthInRangeMin, isNegative, isNumber, isString } from "./baseValidations.js";

export const validatePassword = (password) => {

    const allowedNumber = /\d/;
    const allowedPassword = /^[A-Za-z0-9!@#\$%\^&\*]+$/;
    const fieldName = 'La contraseña';
    let result = isEmptyOrNull(password, fieldName);

    if (result) return result;

    result = isString(password, fieldName);

    if (result) return result;

    result = isLengthInRangeMin(password, AUTH_FIELD_LIMITS.PASSWORD_MIN_LENGTH, fieldName);
    if (result) return result;
    result = isLengthInRangeMax(password, AUTH_FIELD_LIMITS.PASSWORD_MAX_LENGTH, fieldName);
    if (result) return result;
    result = includeUppercase(password, fieldName);
    if (result) return result;
    if (!allowedNumber.test(password)) return `${ fieldName } debe tener al menos un número.`;
    if (!allowedPassword.test(password)) return `${ fieldName } contiene caracteres no permitidos.`;

    return result;
}

export const validateUsername = (username) => {

    const allowedUsername = /^[a-zA-Z0-9_]+$/;
    const fieldName = 'El nombre de usuario';
    let result = isEmptyOrNull(username, fieldName);

    if (result) return result;

    result = isString(username, fieldName);

    if (result) return result;

    username = username.trim();
    result = includeSpace(username, fieldName);

    if (result) return result;

    if (!allowedUsername.test(username)) return `${ fieldName } debe tener solo letras, numeros y guiones bajos`;

    result = isLengthInRangeMax(username, AUTH_FIELD_LIMITS.USERNAME_MAX_LENGTH, fieldName);

    return result;
}

export const validateInvoice = (invoice, { isInvoiced } = {}) => {

    if (![true, 'true', 1, '1'].includes(isInvoiced)) return null;

    const allowedInvoice = /^[a-zA-Z0-9\-]+$/;
    const fieldName = 'El número de factura';
    let result = isEmptyOrNull(invoice, fieldName);

    if (result) return result;

    result = isString(invoice, fieldName);

    if (result) return result;

    invoice = invoice.trim();
    result = isLengthInRangeMax(invoice, FORM_FIELD_LIMITS.INVOICE, fieldName);

    if (result) return result;

    if (!allowedInvoice.test(invoice)) return `${ fieldName } debe tener solo letras, números y guiones.`;

    return null;
}

export const validateWasteWeightCapture = (value, data, fieldName, options = {}) => {
    const code = getWasteWeightCaptureValidationError(value, { ...data, fieldName, ...options });
    if (code) return getErrorMessage({ code });
    if (value !== undefined && value !== null && value !== '' && !isRollPresentation(data.presentationName)) {
        return getErrorMessage({ code: 'WASTE_WEIGHT_INVALID' });
    }
    return null;
};

export const validatePositiveNumber = (value, fieldName, options = {}) =>
    validateNumber(value, fieldName, { ...options, allowZero: false });

export const validateNumber = (value, fieldName, { allowZero = true, minimum = 0, format = DECIMAL_INPUT_FORMAT } = {}) => {
    const requiredError = isEmptyOrNull(value, fieldName);
    if (requiredError) return requiredError;
    if (typeof value !== 'number' && typeof value !== 'string') return `${ fieldName } no es un número válido`;

    const number = Number(value);
    const numericError = isNumber(number, fieldName) || isNegative(number, fieldName);
    if (numericError) return numericError;
    if (!allowZero && number === 0) return `${ fieldName } debe ser un número mayor a cero`;
    if (number < minimum) return `${ fieldName } debe ser al menos ${ minimum }`;
    if (!format.pattern.test(String(value)) || !format.pattern.test(String(number))) {
        return `${ fieldName } admite hasta ${ format.integerDigits } enteros y ${ format.decimalDigits } decimales`;
    }
    return null;
};

export const validateNumberOptional = (value, fieldName, options = {}) =>
    hasValue(value) ? validateNumber(value, fieldName, options) : null;

export const validateUUID = (value, fieldName) => isEmptyOrNull(value, fieldName)
    || (typeof value !== 'string' || !UUID_V4_PATTERN.test(value) ? `${ fieldName } no tiene un identificador válido` : null);

export const validateBoolean = (value, fieldName) => isEmptyOrNull(value, fieldName)
    || (BOOLEAN_INPUT_VALUES.includes(value) ? null : `${ fieldName } debe ser verdadero o falso`);

const hasValue = (value) => value !== undefined && value !== null && value !== '';

export const validatePairedOptionalNumber = ({ value, pairedValue, fieldName, allowZero = true }) => {

    if (!hasValue(value) && hasValue(pairedValue)) return `${ fieldName } es requerida.`;

    return validateNumberOptional(value, fieldName, { allowZero });
}

export const validateDate = (date, fieldName) => {

    let result = isEmptyOrNull(date, fieldName);

    if (result) return result;

    result = isDateTime(date, fieldName);

    return result;
}

export const validateMeasure = (measure, fieldName) => {

    if (!measure) return null;

    let result = isEmptyOrNull(measure, fieldName);

    if (result) return result;

    measure = parseFloat(measure);

    result = isNumber(measure, fieldName);

    return result;
}

export const validateText = ({
    name,
    length,
    fieldName,
    regex = TEXT_INPUT_PATTERN
}) => {

    let result = isEmptyOrNull(name, fieldName);

    if (result) return result;

    result = isString(name, fieldName);

    if (result) return result;

    name = name.trim();
    if (!regex.test(name)) return `${ fieldName } debe tener solo letras, números, signos de puntuación o espacios.`;

    result = isLengthInRangeMax(name, length, fieldName);

    return result;
}

export const validateTextOptional = (name, length, fieldName) => {

    if (name === undefined || name === null || name === '' || (typeof name === 'string' && !name.trim())) return null;

    const result = validateText({
        name,
        length,
        fieldName,
        regex: TEXT_INPUT_PATTERN
    });

    return result;
}

export const validateName = (name, length = 50) => validateText({
    name,
    length,
    fieldName: 'El nombre',
    regex: TEXT_INPUT_PATTERN
});

export const validateGoodsReceiptDetailsArray = details => {
    if (!Array.isArray(details) || !details.length) return 'La lista de detalles debe contener al menos un material.';
    for (const detail of details) {
        if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return 'Cada detalle debe contener material, cantidad y costo por presentación.';
        const error = validateUUID(detail.materialId, 'El material')
            || validateNumber(detail.quantity, 'La cantidad', { minimum: 1 })
            || validatePositiveNumber(detail.costPerUnitType, 'El costo por presentación', { format: MONEY_INPUT_FORMAT });
        if (error) return error;
    }
    return null;
};

export const validateGoodsIssueDetailsArray = details => {
    if (!Array.isArray(details) || !details.length) return 'La lista de detalles debe contener al menos un material.';
    for (const detail of details) {
        if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return 'Cada detalle debe contener material, proveedor y cantidad.';
        const error = validateUUID(detail.materialId, 'El material')
            || validateUUID(detail.supplierId, 'El proveedor')
            || validateNumber(detail.quantity, 'La cantidad', { minimum: 1 });
        if (error) return error;
    }
    return null;
};

export const validateWasteIssueDetailsArray = details => {
    if (!Array.isArray(details) || !details.length) return 'La lista de detalles debe contener al menos una merma.';
    const wasteIds = new Set();
    for (const detail of details) {
        if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return 'Cada detalle debe contener merma y cantidad.';
        const error = validateUUID(detail.wasteId, 'La merma') || validatePositiveNumber(detail.quantity, 'La cantidad');
        if (error) return error;
        const id = detail.wasteId.toLowerCase();
        if (wasteIds.has(id)) return 'No se puede repetir la misma merma en una salida.';
        wasteIds.add(id);
    }
    return null;
};

export const validatePersonAccessesArray = accesses => {
    if (!Array.isArray(accesses) || !accesses.length) {
        return 'Seleccione un área y un rol, y presione Agregar para incluir el acceso en la tabla';
    }
    const departments = new Set();
    for (const access of accesses) {
        if (!access || typeof access !== 'object' || Array.isArray(access)) return 'Cada acceso debe contener un área y un rol válidos';
        const error = validateUUID(access.departmentId, 'El área') || validateUUID(access.roleId, 'El rol');
        if (error) return error;
        const id = access.departmentId.toLowerCase();
        if (departments.has(id)) return 'Cada área sólo puede tener un rol para la persona';
        departments.add(id);
    }
    return null;
};
