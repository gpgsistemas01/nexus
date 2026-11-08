import type { InventoryResource } from './inventory.js';

export type InventoryImportMode = 'create' | 'update' | 'adjust' | 'mixed';
export type ImportValue = string | number | boolean | null;
export interface InventoryImportRow {
    row: number;
    id: string | null;
    name: string;
    action: 'create' | 'update' | 'unchanged' | 'error';
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
    status: 'DRAFT' | 'COMPLETED' | 'CANCELED' | 'EXPIRED';
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
