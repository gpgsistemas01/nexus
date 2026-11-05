import type { InventoryQuery } from '../inventory.js';

export const inventoryParams = (query: Partial<InventoryQuery>) =>
    new URLSearchParams({
        start: String(((query.page ?? 1) - 1) * (query.length ?? 10)),
        length: String(query.length ?? 10),
        search: query.search ?? '',
        supplierId: query.supplierId ?? '',
        'order[0][column]': String(query.orderColumn ?? 0),
        'order[0][dir]': query.direction ?? 'asc',
    });
