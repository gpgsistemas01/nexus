const defaultCurrencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const formatCurrency = (value) => defaultCurrencyFormatter.format(Number(value || 0));
