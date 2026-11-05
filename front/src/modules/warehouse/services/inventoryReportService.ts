import { requestExcel } from '../../../shared/http/requestExcel.js';
import { inventoryParams } from './inventoryPageRequest.js';
import type { InventoryQuery, InventoryResource } from '../inventory.js';

export const inventoryReportService = {
    async export(
        resource: InventoryResource,
        query: InventoryQuery,
        inventoryScope: string,
        signal?: AbortSignal,
    ) {
        const params = inventoryParams(query);
        params.set('inventoryScope', inventoryScope);
        if (resource !== 'wastes')
            params.set('type', resource === 'consumables' ? 'CONSUMABLE' : 'MATERIAL');

        return requestExcel(
            `/api/warehouse/reports/${resource === 'wastes' ? 'wastes' : 'inventory'}/excel?${params}`,
            signal,
        );
    },
};
