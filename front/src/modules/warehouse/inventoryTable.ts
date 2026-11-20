import { inventoryLabels } from './inventoryDisplay.js';
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
    hasMeasurements = resource !== 'consumables',
): DataTableHeader<InventoryRow>[] => {
    const labels = inventoryLabels(resource);
    const isConsumable = resource === 'consumables';
    const isWaste = resource === 'wastes';

    const quantity = (
        title: string,
        key: string,
        sortable = false,
    ): DataTableHeader<InventoryRow> => ({
        ...column(title, key, sortable),
        ...(isWaste && { align: 'end' as const }),
    });

    const headers: DataTableHeader<InventoryRow>[] = [column(labels.name, 'name', true)];
    if (hasMeasurements)
        headers.push({
            title: 'Medidas',
            align: 'center',
            children: [
                quantity(labels.base, 'base', resource === 'materials'),
                quantity(labels.height, 'height', resource === 'materials'),
            ],
        });

    headers.push({
        ...column(labels.presentation, 'presentation'),
        ...(isWaste && { width: '7rem' }),
    });
    if (isConsumable) headers.push(column(labels.unitMeasure, 'unitMeasure'));

    if (isWaste)
        headers.push({
            title: 'Pesos por unidad (kg)',
            align: 'center',
            children: [
                quantity('Cono', 'coneWeightKg'),
                quantity('Total con cono', 'totalWeightKg'),
                quantity('Neto', 'weightKg'),
            ],
        });

    const balances = [
        quantity(labels.currentStock, 'currentStock'),
        quantity(labels.minStock, 'minStock', resource === 'materials'),
    ];

    if (isWaste) headers.push({ title: 'Existencias', align: 'center', children: balances });
    else headers.push(...balances);

    if (!isConsumable)
        headers.push({
            title: 'Conversión',
            align: 'center',
            children: [quantity('Cantidad', 'convertedQuantity'), column('Unidad', 'unitMeasure')],
        });

    if (permissions.canReadCosts) headers.push(quantity(labels.maxUnitCost, 'maxUnitCost'));

    if (permissions.canReadState) headers.push(column(labels.isActive, 'isActive'));

    if (permissions.canWrite || permissions.canAdjust || permissions.canAdd)
        headers.push({
            ...column('Acciones', 'actions'),
            ...(isWaste && { width: '6rem' }),
        });

    return headers;
};

// Sólo se habilita orden para las columnas que reconoce la API existente.
export const INVENTORY_SORT_COLUMNS: Readonly<Record<string, number>> = {
    name: 0,
    base: 1,
    height: 2,
    minStock: 4,
};
