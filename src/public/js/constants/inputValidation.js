export const DECIMAL_INPUT_FORMAT = Object.freeze({
    integerDigits: 8,
    decimalDigits: 2,
    minimumPositive: 0.01,
    pattern: /^\d{1,8}(\.\d{1,2})?$/
});

export const MONEY_INPUT_FORMAT = Object.freeze({
    integerDigits: 8,
    decimalDigits: 6,
    pattern: /^\d{1,8}(\.\d{1,6})?$/
});

export const MIN_STOCK_INPUT_FORMAT = Object.freeze({
    integerDigits: 12,
    decimalDigits: 2,
    pattern: /^\d{1,12}(\.\d{1,2})?$/
});

export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const PERSON_NAME_PATTERN = /^[\p{L}0-9]+(?:[ '\-.,:;()¿?¡!][\p{L}0-9]+)*[.,:;()¿?¡!]*$/u;
export const TEXT_INPUT_PATTERN = /^[^<>\\{}[\]]+$/u;
export const ISO_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;
export const BOOLEAN_INPUT_VALUES = Object.freeze([true, false, 1, 0, 'true', 'false', '1', '0']);

export const FORM_FIELD_LIMITS = Object.freeze({
    PERSON_NAME: 255,
    CLIENT_NAME: 255,
    MATERIAL_NAME: 200,
    SUPPLIER_LEGAL_NAME: 200,
    SUPPLIER_TRADE_NAME: 100,
    OBSERVATIONS: 500,
    PROJECT_NUMBER: 10,
    INVOICE: 50
});
