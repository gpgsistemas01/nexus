import type { RecordQuery } from '../../shared/list.js';

export type MovementResource = 'materials' | 'consumables' | 'wastes';
export type MovementType = '' | 'ENTRY' | 'ISSUE' | 'ADJUSTMENT' | 'RETURN';

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
