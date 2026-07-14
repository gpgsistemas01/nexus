const defaultCurrencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const defaultDecimalFormatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// Presentation helpers: return localized strings for read-only UI/table cells.
export const formatCurrency = (value) => defaultCurrencyFormatter.format(Number(value || 0));

export const formatDecimal = (value) => defaultDecimalFormatter.format(Number(value || 0));

// Calculation helper: keeps values numeric before sending them to forms, tables or APIs.
// Use this instead of formatDecimal/formatCurrency when the result must remain a number.
export const roundTo = (value, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};
