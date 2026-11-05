import { MEXICO_TIME_ZONE } from '@nexus/date-time';

export interface ReportScope {
    mode: 'filtered' | 'current-month' | 'specific-month';
    month: string;
    inventoryScope?: 'activeOrStock' | 'active' | 'inStock';
}

export type ReportKind = 'period' | 'inventory' | 'filtered';

export const reportFilename = (name: string, date = new Date()): string => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: MEXICO_TIME_ZONE,
        month: '2-digit',
        year: 'numeric',
    }).formatToParts(date);

    const part = (type: string) => parts.find((value) => value.type === type)!.value;

    return `${name.replace(/\.xlsx$/i, '')}_${part('month')}_${part('year')}.xlsx`;
};

export const reportParams = (query: URLSearchParams, scope: ReportScope): URLSearchParams => {
    const error = reportScopeError(scope);
    if (error) throw new Error(error);

    const params =
        scope.mode === 'filtered'
            ? new URLSearchParams(query)
            : new URLSearchParams({
                  monthlyReport: 'true',
                  reportMonth: scope.mode === 'specific-month' ? scope.month : '',
              });

    for (const key of ['order[0][column]', 'order[0][dir]']) {
        if (query.has(key)) params.set(key, query.get(key)!);
    }

    params.delete('start');
    params.delete('length');
    return params;
};

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
