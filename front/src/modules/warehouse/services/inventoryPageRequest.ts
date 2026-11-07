import type { InventoryQuery } from '../inventory.js';
import { recordParams } from '../../../shared/http/recordParams.js';

export const inventoryParams = (query: Partial<InventoryQuery>) => {
    const params = recordParams({
        page: query.page ?? 1,
        length: query.length ?? 10,
        search: query.search ?? '',
        orderColumn: query.orderColumn ?? 0,
        direction: query.direction ?? 'asc',
    });
    params.set('supplierId', query.supplierId ?? '');
    return params;
};
