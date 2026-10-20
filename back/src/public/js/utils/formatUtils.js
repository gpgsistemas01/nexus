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
