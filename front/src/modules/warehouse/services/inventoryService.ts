import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { normalizeInventoryRow } from '../mappers/inventoryMapper.js';
import { inventoryParams, requestInventoryPage } from './inventoryPageRequest.js';
import type {
    InventoryAction,
    InventoryPayload,
    InventoryQuery,
    InventoryResource,
} from '../inventory.js';

export const inventoryService = {
    async list(resource: InventoryResource, query: InventoryQuery, signal?: AbortSignal) {
        const page = await requestInventoryPage(
            `/api/warehouse/${resource}?${inventoryParams(query)}`,
            signal,
        );
        return { ...page, data: page.data.map(normalizeInventoryRow) };
    },
    async mutate(
        resource: InventoryResource,
        action: InventoryAction,
        payload: InventoryPayload,
        id?: string,
        signal?: AbortSignal,
    ) {
        const suffix =
            action === 'create'
                ? ''
                : `/${encodeURIComponent(id ?? '')}${action === 'stock' ? '/stock' : action === 'add-stock' ? '/stock-additions' : ''}`;
        const method =
            action === 'delete'
                ? 'DELETE'
                : action === 'create' || action === 'add-stock'
                  ? 'POST'
                  : 'PATCH';
        const result = await apiClient.request<{ code: string }>(
            `/api/warehouse/${resource}${suffix}`,
            {
                method,
                headers: { 'Content-Type': 'application/json' },
                ...(action !== 'delete' ? { data: payload } : {}),
                signal,
            },
        );
        const expected =
            action === 'create'
                ? resource === 'wastes'
                    ? 'CREATED_WASTE'
                    : 'CREATED_MATERIAL'
                : action === 'delete'
                  ? 'DELETED_MATERIAL'
                  : resource === 'wastes'
                    ? 'UPDATED_WASTE'
                    : 'UPDATED_MATERIAL';
        if (result.code !== expected)
            throw new ApiError(
                'No se pudo confirmar la operación. Revisa el inventario antes de reintentar.',
            );
        return result;
    },
};
