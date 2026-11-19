import { INVENTORY_CONFIG } from './inventory.js';
import type { InventoryResource, InventoryAction } from './inventory.js';

// Nombres compartidos por la tabla y los formularios de existencias.
export const inventoryLabels = (resource: InventoryResource) => ({
    name: resource === 'consumables' ? 'Consumible' : resource === 'wastes' ? 'Merma' : 'Material',
    base: 'Base',
    height: 'Altura',
    presentation: 'Presentación',
    unitMeasure: 'Unidad de medida',
    currentStock: resource === 'consumables' ? 'Existencia' : 'Stock actual',
    minStock: 'Stock mínimo',
    maxUnitCost: 'Costo máximo unitario',
    isActive: 'Activo',
});

export const inventoryActionTitle = (
    resource: InventoryResource,
    action: InventoryAction,
    creationContext?: 'goodsReceipt',
) => {
    const item = INVENTORY_CONFIG[resource].singular;
    const subject = resource !== 'wastes' && !creationContext ? `existencia de ${item}` : item;
    const editTitle = resource === 'wastes' ? `Editar ${subject}` : `Editar oferta de ${item}`;
    const titles: Record<InventoryAction, string> = {
        create: `Registrar ${subject}`,
        edit: editTitle,
        delete: `Eliminar ${subject}`,
        stock: `Ajustar stock de ${item}`,
        'add-stock': `Agregar stock de ${item}`,
    };
    return titles[action];
};
