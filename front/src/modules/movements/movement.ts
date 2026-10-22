import type { RecordQuery } from '../../shared/list.js';

export type MovementResource = 'materials' | 'consumables' | 'wastes';
export type MovementType = '' | 'ENTRY' | 'ISSUE' | 'ADJUSTMENT' | 'RETURN';
export type ReportMode = 'filtered' | 'current-month' | 'specific-month';

export interface MovementFilters {
    startDate: string;
    endDate: string;
    movementType: MovementType;
    supplierId: string;
    itemId: string;
}
export type MovementQuery = MovementFilters & RecordQuery;
export interface MovementRow {
    id: string;
    date: string;
    type: string;
    referenceNumber: string;
    materialName: string;
    supplierName: string;
    materialBase: string | number | null;
    materialHeight: string | number | null;
    previousStock: string | number | null;
    quantity: string | number | null;
    newStock: string | number | null;
}
export interface MovementReport {
    mode: ReportMode;
    month: string;
}

export const MOVEMENT_CONFIG = {
    materials: {
        title: 'Movimientos de materiales',
        label: 'Materiales',
        itemLabel: 'Material',
        path: 'materiales',
    },
    consumables: {
        title: 'Movimientos de consumibles',
        label: 'Consumibles',
        itemLabel: 'Consumible',
        path: 'consumibles',
    },
    wastes: { title: 'Movimientos de merma', label: 'Mermas', itemLabel: 'Merma', path: 'mermas' },
} as const;

export const MOVEMENT_TYPES = [
    { value: '', title: 'Todos' },
    { value: 'ENTRY', title: 'Entrada' },
    { value: 'ISSUE', title: 'Salida' },
    { value: 'ADJUSTMENT', title: 'Ajuste' },
    { value: 'RETURN', title: 'Devolución' },
] as const;

export const emptyMovementFilters = (): MovementFilters => ({
    startDate: '',
    endDate: '',
    movementType: '',
    supplierId: '',
    itemId: '',
});

const validDate = (value: string) => {
    if (!value) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const movementFilterError = (filters: MovementFilters): string => {
    if (!validDate(filters.startDate) || !validDate(filters.endDate))
        return 'Selecciona fechas válidas.';

    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate)
        return 'La fecha de inicio no puede ser posterior a la fecha de fin.';

    return '';
};

export const movementReportError = (report: MovementReport): string =>
    report.mode === 'specific-month' &&
    (!/^\d{4}-(0[1-9]|1[0-2])$/.test(report.month) || report.month.startsWith('0000'))
        ? 'Selecciona un mes válido para el reporte.'
        : '';
