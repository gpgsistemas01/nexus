import type { DataTableHeader } from 'vuetify';
import type { InventoryPermissions, InventoryResource, InventoryRow } from './inventory.js';

const column = (title: string, key: string, sortable = false): DataTableHeader<InventoryRow> => ({
    title,
    key,
    sortable,
    nowrap: true,
});

export const inventoryHeaders = (
    resource: InventoryResource,
    permissions: InventoryPermissions,
): DataTableHeader<InventoryRow>[] => {
    const isConsumable = resource === 'consumables';
    const headers: DataTableHeader<InventoryRow>[] = [
        column(isConsumable ? 'Consumible' : 'Material', 'name', true),
    ];
    if (!isConsumable)
        headers.push({
            title: 'Medidas',
            align: 'center',
            children: [
                column('Base', 'base', resource === 'materials'),
                column('Altura', 'height', resource === 'materials'),
            ],
        });
    headers.push(
        column(isConsumable ? 'Existencia' : 'Stock actual', 'currentStock'),
        column('Stock Mínimo', 'minStock', resource === 'materials'),
        column('Presentación', 'presentation'),
    );
    if (isConsumable) headers.push(column('Unidad de medida', 'unitMeasure'));
    else
        headers.push({
            title: 'Conversión',
            align: 'center',
            children: [column('Cantidad', 'convertedQuantity'), column('Unidad', 'unitMeasure')],
        });
    if (permissions.canReadCosts)
        headers.push(
            column(isConsumable ? 'Costo Unitario' : 'Costo Unitario de Conversión', 'maxUnitCost'),
        );
    if (permissions.canReadState) headers.push(column('Activo', 'isActive'));
    if (resource === 'wastes')
        headers.push({
            title: 'Pesos por unidad (kg)',
            align: 'center',
            children: [
                column('Cono', 'coneWeightKg'),
                column('Total con cono', 'totalWeightKg'),
                column('Neto', 'weightKg'),
            ],
        });
    if (permissions.canWrite || permissions.canAdjust || permissions.canAdd)
        headers.push(column('Acciones', 'actions'));
    return headers;
};

// Sólo se habilita orden para las columnas que reconoce la API existente.
export const INVENTORY_SORT_COLUMNS: Readonly<Record<string, number>> = {
    name: 0,
    base: 1,
    height: 2,
    minStock: 4,
};
export const numberText = (value: string | number | null | undefined) =>
    value == null ? '—' : Number(value).toLocaleString('es-MX', { maximumFractionDigits: 6 });
export const currencyText = (value: string | number | null | undefined) =>
    value == null
        ? '—'
        : Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
