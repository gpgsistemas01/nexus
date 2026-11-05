import { PERMISSIONS } from '@nexus/permissions';

export type InventoryResource = 'materials' | 'consumables' | 'wastes';
export type InventoryAction = 'create' | 'edit' | 'stock' | 'add-stock' | 'delete';
export type Numeric = string | number | null;

export interface InventoryRow {
    id: string;
    entityId: string;
    version: number;
    materialVersion?: number;
    supplierId: string;
    supplierName: string;
    name: string;
    presentationId: string;
    presentation: string;
    unitMeasureId: string;
    unitMeasure: string;
    base: Numeric;
    height: Numeric;
    currentStock: Numeric;
    convertedQuantity: Numeric;
    minStock: Numeric;
    maxUnitCost?: Numeric;
    isActive: boolean;
    canDelete: boolean;
    coneWeightKg: Numeric;
    totalWeightKg: Numeric;
    weightKg: Numeric;
    referenceRollTotalWeightKg: Numeric;
    sampleLengthM: Numeric;
    sampleNetWeightKg: Numeric;
}

export interface InventoryQuery {
    search: string;
    supplierId: string;
    page: number;
    length: number;
    direction: 'asc' | 'desc';
    orderColumn?: number;
}
export interface InventoryPermissions {
    canRead: boolean;
    canWrite: boolean;
    canAdjust: boolean;
    canAdd: boolean;
    canReadCosts: boolean;
    canReadState: boolean;
    canExport: boolean;
}
export interface StockAdditionTarget {
    action: 'add-stock';
    row: Partial<InventoryRow> &
        Pick<InventoryRow, 'id' | 'entityId' | 'name' | 'supplierName' | 'currentStock'>;
    quantity?: string;
    observations?: string;
}
export type EditorTarget =
    | { action: Exclude<InventoryAction, 'add-stock'>; row?: InventoryRow; initialName?: string }
    | StockAdditionTarget;

export const INVENTORY_CONFIG = {
    materials: {
        title: 'Materiales',
        tableTitle: 'Existencias',
        singular: 'material',
        read: PERMISSIONS.MATERIALS_READ,
        write: PERMISSIONS.MATERIALS_WRITE,
        adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK,
    },
    consumables: {
        title: 'Consumibles',
        tableTitle: 'Consumibles',
        singular: 'consumible',
        read: PERMISSIONS.MATERIALS_READ,
        write: PERMISSIONS.MATERIALS_WRITE,
        adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK,
    },
    wastes: {
        title: 'Mermas',
        tableTitle: 'Mermas',
        singular: 'merma',
        read: PERMISSIONS.WASTES_READ,
        write: PERMISSIONS.WASTES_WRITE,
        adjust: PERMISSIONS.WASTES_ADJUST_STOCK,
    },
} as const;

export interface InventoryValues {
    name: string;
    supplierId: string;
    presentationId: string;
    unitMeasureId: string;
    materialId: string;
    base: string;
    height: string;
    minStock: string;
    maxUnitCost: string;
    isActive: boolean;
    newStock: string;
    initialQuantity: string;
    quantity: string;
    reasonId: string;
    observations: string;
    coneWeightKg: string;
    totalWeightKg: string;
    referenceRollTotalWeightKg: string;
}
export type InventoryField = keyof InventoryValues;
export type InventoryPayload = Record<string, string | number | boolean | null>;
