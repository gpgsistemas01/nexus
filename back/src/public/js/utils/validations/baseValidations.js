import { ISO_DATE_TIME_PATTERN } from '../../../../shared/constants/inputValidation.js';

export const isEmptyOrNull = (value, fieldName) => {
    
    if (value === null || 
        value === undefined || 
        (typeof value === 'string' && value.trim().length === 0)
    ) { 

        return `${ fieldName } es un valor requerido`;
    }

    return null;
};

export const isString = (value, fieldName) => {
    
    if (typeof value === 'string') return null;

    return `${ fieldName } no es una cadena de texto`;
};

export const isNumber = (value, fieldName) => {
    
    if (typeof value === 'number' && Number.isFinite(value)) return null;

    return `${ fieldName } no es un número válido`;
};

export const isNegative = (value, fieldName) => {

    if (value < 0) return `${ fieldName } no puede ser negativo`;

    return null;
}

export const isPositive = (value, fieldName) => {

    if (value <= 0) return `${ fieldName } debe ser un número mayor a cero`;

    return null;
}

const isValidDateTimeParts = ({ year, month, day, hour, minute, second }) => {

    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second, 0);

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day
        && date.getUTCHours() === hour
        && date.getUTCMinutes() === minute
        && date.getUTCSeconds() === second;
};

const parseDateTimeParts = (value) => {

    const match = typeof value === 'string' ? value.match(ISO_DATE_TIME_PATTERN) : null;

    if (!match) return null;

    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;

    return {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
        second: Number(second)
    };
};

export const isDateTime = (value, fieldName) => {

    if (!value) return `${ fieldName } es requerido`;

    const parts = parseDateTimeParts(value);

    if (!parts) return `${ fieldName } no tiene un formato válido`;

    if (!isValidDateTimeParts(parts) || Number.isNaN(new Date(value).getTime())) return `${ fieldName } no es una fecha válida`;

    return null;
}

export const isLengthInRangeMin = (value, min, fieldName) => {

    const length = Array.from(value).length;

    if (length < min) return `${ fieldName } debe tener al menos ${ min } caracteres`;

    return null;
}

export const isLengthInRangeMax = (value, max, fieldName) => {

    const length = Array.from(value).length;

    if (length > max) return `${ fieldName } no debe exceder los ${ max } caracteres`;
    
    return null;
};

export const includeSpace = (value, fieldName) => {
    
    if (value.includes(' ')) return `${ fieldName } no debe contener espacios`;

    return null;
};

export const includeUppercase = (value, fieldName) => {
    
    if (!/[A-Z]/.test(value)) return `${ fieldName } debe tener al menos una letra mayúscula`;

    return null;
};

export const isNumberphone = (value) => {

    const regex = /^(\+52\s?)?(\d{2,3}[- ]?\d{3}[- ]?\d{4})$/;

    if (!regex.test(value)) return 'El teléfono es inválido';

    return null;
}
