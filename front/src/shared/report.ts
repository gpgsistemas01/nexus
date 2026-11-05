export interface ReportScope {
    mode: 'filtered' | 'current-month' | 'specific-month';
    month: string;
}

export const reportScopeError = (report: ReportScope): string =>
    report.mode === 'specific-month' &&
    (!/^\d{4}-(0[1-9]|1[0-2])$/.test(report.month) || report.month.startsWith('0000'))
        ? 'Selecciona un mes válido para el reporte.'
        : '';

const validDate = (value: string) => {
    if (!value) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const dateRangeError = (filters: { startDate: string; endDate: string }): string => {
    if (!validDate(filters.startDate) || !validDate(filters.endDate))
        return 'Selecciona fechas válidas.';

    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate)
        return 'La fecha de inicio no puede ser posterior a la fecha de fin.';

    return '';
};
