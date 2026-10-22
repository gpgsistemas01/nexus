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

export interface LookupItem {
    id: string;
    title: string;
    data: Record<string, unknown>;
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
export interface EditorTarget {
    action: InventoryAction;
    row?: InventoryRow;
}

export const INVENTORY_CONFIG = {
    materials: {
        title: 'Materiales',
        singular: 'material',
        read: PERMISSIONS.MATERIALS_READ,
        write: PERMISSIONS.MATERIALS_WRITE,
        adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK,
    },
    consumables: {
        title: 'Consumibles',
        singular: 'consumible',
        read: PERMISSIONS.MATERIALS_READ,
        write: PERMISSIONS.MATERIALS_WRITE,
        adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK,
    },
    wastes: {
        title: 'Mermas',
        singular: 'merma',
        read: PERMISSIONS.WASTES_READ,
        write: PERMISSIONS.WASTES_WRITE,
        adjust: PERMISSIONS.WASTES_ADJUST_STOCK,
    },
} as const;

export type InventoryField =
    | 'name'
    | 'supplierId'
    | 'presentationId'
    | 'unitMeasureId'
    | 'materialId'
    | 'base'
    | 'height'
    | 'minStock'
    | 'maxUnitCost'
    | 'isActive'
    | 'newStock'
    | 'initialQuantity'
    | 'quantity'
    | 'reasonId'
    | 'observations'
    | 'coneWeightKg'
    | 'totalWeightKg'
    | 'referenceRollTotalWeightKg';
export type InventoryValues = Record<InventoryField, string | boolean>;
export type InventoryPayload = Record<string, string | number | boolean | null>;
