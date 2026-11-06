const SCRIPT_DATA_ESCAPES = Object.freeze({
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
});

// JSON.stringify no impide que el parser HTML cierre un <script> dentro de un string.
export const serializeScriptData = value => JSON.stringify(value ?? null)
    .replace(/[<>&\u2028\u2029]/g, character => SCRIPT_DATA_ESCAPES[character]);
