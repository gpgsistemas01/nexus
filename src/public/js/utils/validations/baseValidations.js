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
    
    if (typeof value === 'number' && !isNaN(value)) return null;

    return `${ fieldName } no es un número válido`;
};

export const isNegative = (value, fieldName) => {

    if (value < 0) return `${ fieldName } no puede ser negativo`;

    return null;
}

export const isPositive = (value, fieldName) => {

    if (value < 1) return `${ fieldName } debe ser un número mayor a cero`;

    return null;
}

const isValidDateTimeParts = ({ year, month, day, hour, minute, second }) => {

    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day
        && date.getUTCHours() === hour
        && date.getUTCMinutes() === minute
        && date.getUTCSeconds() === second;
};

const parseDateTimeParts = (value) => {

    const match = String(value).match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{3})?)?(?:Z)?$/
    );

    if (!match) return null;

    const [, year, month, day, hour, minute, second = '0'] = match;

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

    if (!isValidDateTimeParts(parts)) return `${ fieldName } no es una fecha válida`;

    return null;
}

export const isLengthInRangeMin = (value, min, fieldName) => {

    const length = value.length;

    if (length < min) return `${ fieldName } debe tener al menos ${ min } caracteres`;

    return null;
}

export const isLengthInRangeMax = (value, max, fieldName) => {

    const length = value.length;

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