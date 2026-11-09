import type { InventoryResource } from './inventory.js';
import {
    INVENTORY_IMPORT_MODES,
    INVENTORY_IMPORT_STATUSES,
    INVENTORY_IMPORT_ROW_ACTIONS,
    LEGACY_INVENTORY_IMPORT_MODE,
} from '@nexus/inventory-imports';

export type InventoryImportOperation =
    (typeof INVENTORY_IMPORT_MODES)[keyof typeof INVENTORY_IMPORT_MODES];
export type InventoryImportMode = InventoryImportOperation | typeof LEGACY_INVENTORY_IMPORT_MODE;

export const isInventoryImportOperation = (value: unknown): value is InventoryImportOperation =>
    Object.values(INVENTORY_IMPORT_MODES).some((mode) => mode === value);

export type ImportValue = string | number | boolean | null;
export interface InventoryImportRow {
    row: number;
    id: string | null;
    name: string;
    action: (typeof INVENTORY_IMPORT_ROW_ACTIONS)[keyof typeof INVENTORY_IMPORT_ROW_ACTIONS];
    before: Record<string, ImportValue> | null;
    after: Record<string, ImportValue> | null;
    details: Record<string, ImportValue>;
    errors: { column: string; message: string; code: string }[];
    warnings: string[];
}
export interface InventoryImportPreview {
    summary: { total: number; creates: number; updates: number; unchanged: number; errors: number };
    rows: InventoryImportRow[];
}
export interface InventoryImportBatch {
    id: string;
    version: number;
    resource: InventoryResource;
    mode: InventoryImportMode;
    status: (typeof INVENTORY_IMPORT_STATUSES)[keyof typeof INVENTORY_IMPORT_STATUSES];
    filename: string;
    expiresAt: string;
    preview: InventoryImportPreview | null;
    result: InventoryImportPreview | null;
}
export interface PendingInventoryImport {
    id: string;
    expectedVersion: number;
    operationId: string;
}

export const IMPORT_FIELD_LABELS: Record<string, string> = {
    sourceMaterial: 'Material de referencia',
    name: 'Nombre',
    minStock: 'Stock mínimo',
    maxUnitCost: 'Costo máximo unitario',
    isActive: 'Activo',
    supplier: 'Proveedor',
    supplierCode: 'Código del proveedor',
    presentation: 'Presentación',
    unit: 'Unidad',
    base: 'Base (m)',
    height: 'Altura (m)',
    initialQuantity: 'Cantidad inicial',
    coneWeightKg: 'Cono (kg)',
    totalWeightKg: 'Merma con cono (kg)',
    referenceRollTotalWeightKg: 'Rollo completo con cono (kg)',
    weightKg: 'Peso neto (kg)',
    observations: 'Observaciones',
    currentStock: 'Stock por presentación',
    convertedQuantity: 'Cantidad convertida',
    difference: 'Diferencia de stock',
    reason: 'Motivo',
    adjustmentReference: 'Folio del ajuste',
    operation: 'Operación de la fila',
};
