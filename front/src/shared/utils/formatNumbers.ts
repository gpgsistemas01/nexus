import { isSquareMeterUnitMeasure } from '@nexus/waste-measurements';

type NumericDisplayValue = string | number | null | undefined;
const AREA_DECIMAL_DIGITS = 2;

const formatNumber = (value: NumericDisplayValue, options: Intl.NumberFormatOptions) =>
    value == null ? '—' : Number(value).toLocaleString('es-MX', options);

export const numberText = (value: NumericDisplayValue) =>
    formatNumber(value, { maximumFractionDigits: 6 });

export const currencyText = (value: NumericDisplayValue) =>
    formatNumber(value, { style: 'currency', currency: 'MXN' });

export const convertedQuantityText = (
    value: NumericDisplayValue,
    unitMeasure: string,
    options: Pick<Intl.NumberFormatOptions, 'useGrouping'> = {},
) => {
    const isArea = isSquareMeterUnitMeasure({ name: unitMeasure, symbol: unitMeasure });
    const displayValue =
        isArea && value != null && Math.abs(Number(value)) < 0.5 * 10 ** -AREA_DECIMAL_DIGITS
            ? 0
            : value;
    return formatNumber(displayValue, {
        maximumFractionDigits: isArea ? AREA_DECIMAL_DIGITS : 6,
        minimumFractionDigits: isArea ? AREA_DECIMAL_DIGITS : 0,
        ...options,
    });
};
