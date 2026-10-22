import { apiClient } from '../../../shared/http/apiClient.js';
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

        const file = await apiClient.request<Blob>(
            `/api/warehouse/reports/${resource === 'wastes' ? 'wastes' : 'inventory'}/excel?${params}`,
            { signal, responseType: 'blob' },
        );
        if (
            !file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        )
            throw new Error('El servidor no devolvió un archivo Excel válido.');

        return file;
    },
};
