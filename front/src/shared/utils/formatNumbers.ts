export const numberText = (value: string | number | null | undefined) =>
    value == null ? '—' : Number(value).toLocaleString('es-MX', { maximumFractionDigits: 6 });

export const currencyText = (value: string | number | null | undefined) =>
    value == null
        ? '—'
        : Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
