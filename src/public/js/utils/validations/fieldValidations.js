import { includeSpace, includeUppercase, isDateTime, isEmptyOrNull, isLengthInRangeMax, isLengthInRangeMin, isNegative, isNumber, isPositive, isString } from "./baseValidations.js";

export const validatePassword = (password) => {

    const allowedNumber = /\d/;
    const allowedPassword = /^[A-Za-z0-9!@#\$%\^&\*]+$/;
    const fieldName = 'La contraseña';
    let result = isEmptyOrNull(password, fieldName);

    if (result) return result;

    result = isString(password, fieldName);

    if (result) return result;

    result = includeUppercase(password, fieldName);

    if (result) return result;

    if (!allowedNumber.test(password)) return `${ fieldName } debe tener al menos un número.`;

    if (!allowedPassword.test(password)) return  `${ fieldName } debe tener al menos un símbolo especial.`;

    result = isLengthInRangeMin(password, 6, fieldName);

    if (result) return result;

    result = isLengthInRangeMax(password, 50, fieldName);

    return result;
}

export const validateUsername = (username) => {

    const allowedUsername = /^[a-zA-Z0-9_]+$/;
    const fieldName = 'El nombre de usuario';
    let result = isEmptyOrNull(username, fieldName);

    if (result) return result;

    result = isString(username, fieldName);

    if (result) return result;

    result = includeSpace(username, fieldName);

    if (result) return result;

    result = includeUppercase(username, fieldName);

    if (result) return result;

    if (!allowedUsername.test(username)) return `${ fieldName } debe tener solo letras, numeros y guiones bajos`;

    result = isLengthInRangeMax(username, 50, fieldName);

    return result;
}

export const validateInvoice = (invoice, { isInvoiced } = {}) => {

    if (!isInvoiced) return null;

    const allowedInvoice = /^[a-zA-Z0-9\-]+$/;
    const fieldName = 'El número de factura';
    let result = isEmptyOrNull(invoice, fieldName);

    if (result) return result;

    result = isString(invoice, fieldName);

    if (result) return result;

    result = isLengthInRangeMax(invoice, 50, fieldName);

    if (result) return result;

    if (!allowedInvoice.test(invoice)) return `${ fieldName } debe tener solo letras, números y guiones.`;

    return null;
}

export const validateNonNegativeNumber = (number, fieldName) => {
    const result = validateNumber(number, fieldName);

    return result || isNegative(number, fieldName);
};

export const validatePositiveNumber = (number, fieldName) => {

    let result = validateNumber(number, fieldName);

    if (result) return result;

    result = isPositive(number, fieldName);

    if (result) return result;

    return null;
}

export const validateNumber = (number, fieldName, { allowZero = true } = {}) => {

    let result = isEmptyOrNull(number, fieldName);

    if (result) return result;

    number = parseFloat(number);

    result = isNumber(number, fieldName);

    if (result) return result;

    result = isNegative(number, fieldName);

    if (result) return result;

    if (!allowZero && number === 0) return `${ fieldName } debe ser un número mayor a cero`;

    return null;
}

export const validateNumberOptional = (number, fieldName, { allowZero = true } = {}) => {

    if (!hasValue(number)) return null;

    number = parseFloat(number);

    let result = isNumber(number, fieldName);

    if (result) return result;

    result = isNegative(number, fieldName);

    if (result) return result;

    if (!allowZero && number === 0) return `${ fieldName } debe ser un número mayor a cero`;

    return null;
}

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

export const validateDateOptional = (date, fieldName) => {

    if (!date) return null;

    const result = isDateTime(date, fieldName);

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
    regex = /^[^<>\\{}[\]]+$/u
}) => {

    let result = isEmptyOrNull(name, fieldName);

    if (result) return result;

    result = isString(name, fieldName);

    if (result) return result;

    if (!regex.test(name)) return `${ fieldName } debe tener solo letras, números, signos de puntuación o espacios.`;

    result = isLengthInRangeMax(name, length, fieldName);

    return result;
}

export const validateTextOptional = (name, length, fieldName) => {

    if (!name) return null;

    const result = validateText({
        name,
        length,
        fieldName,
        regex: /^[^<>\\{}[\]]+$/u
    });

    return result;
}

export const validateName = (name, length = 50) => validateText({
    name,
    length,
    fieldName: 'El nombre',
    regex: /^[^<>\\{}[\]]+$/u
});

export const validateGoodsReceiptDetailsArray = (details) => {

    if (!Array.isArray(details) || details.length === 0) {
        return 'La lista de detalles debe contener al menos un material.';
    }

    for (const detail of details) {

        if (!detail.materialId || !detail.quantity || !detail.costPerUnitType) {
            return 'Cada detalle debe contener material, cantidad y costo por presentación.';
        }

        if (isNaN(detail.quantity) || parseFloat(detail.quantity) < 1) {
            return 'La cantidad de cada detalle debe ser un número mayor a cero.';
        }

        if (isNaN(detail.costPerUnitType) || parseFloat(detail.costPerUnitType) <= 0) {
            return 'El costo por presentación de cada detalle debe ser un número mayor a cero.';
        }
    }

    return null;
};

export const validateGoodsIssueDetailsArray = (details) => {

    if (!Array.isArray(details) || details.length === 0) {
        return 'La lista de detalles debe contener al menos un material.';
    }

    for (const detail of details) {

        if (!detail.materialId || !detail.supplierId || !detail.quantity) {
            return 'Cada detalle debe contener material, proveedor y cantidad.';
        }

        if (isNaN(detail.quantity) || parseFloat(detail.quantity) < 1) {
            return 'La cantidad de cada detalle debe ser un número mayor a cero.';
        }

    }

    return null;
}

export const validateWasteIssueDetailsArray = details => {

    if (!Array.isArray(details) || !details.length) {
        return 'La lista de detalles debe contener al menos una merma.';
    }

    const wasteIds = new Set();

    for (const detail of details) {

        if (!detail.wasteId || detail.quantity === '' || detail.quantity === null || detail.quantity === undefined) {
            return 'Cada detalle debe contener merma y cantidad.';
        }

        if (wasteIds.has(detail.wasteId)) {
            return 'No se puede repetir la misma merma en una salida.';
        }

        wasteIds.add(detail.wasteId);

        const quantity = Number(detail.quantity);

        if (
            !Number.isFinite(quantity)
            || quantity <= 0
            || !/^\d{1,8}(\.\d{1,6})?$/.test(String(detail.quantity))
        ) {
            return 'La cantidad de cada detalle debe ser un número mayor a cero.';
        }
    }

    return null;
};

export const validatePersonAccessesArray = accesses => {
    if (!Array.isArray(accesses) || !accesses.length) {
        return 'Seleccione un área y un rol, y presione Agregar para incluir el acceso en la tabla';
    }

    return null;
};
