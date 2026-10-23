import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { normalizeInventoryRow } from '../mappers/inventoryMapper.js';
import { inventoryParams } from './inventoryPageRequest.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import type {
    InventoryAction,
    InventoryPayload,
    InventoryQuery,
    InventoryResource,
} from '../inventory.js';
import type { LookupItem } from '../../../shared/lookup.js';
import { isRecord } from '../../../shared/utils/isRecord.js';

export const inventoryService = {
    async list(resource: InventoryResource, query: InventoryQuery, signal?: AbortSignal) {
        const page = await requestPage(
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
        const result = await apiClient.request<{ code: string; material?: unknown }>(
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
    async createForPurchase(
        resource: 'materials' | 'consumables',
        payload: InventoryPayload,
        signal: AbortSignal,
    ): Promise<LookupItem> {
        const result = await inventoryService.mutate(
            resource,
            'create',
            { ...payload, creationContext: 'goodsReceipt' },
            undefined,
            signal,
        );
        if (!isRecord(result.material))
            throw new ApiError(
                'No se pudo identificar el artículo registrado. Actualiza las opciones antes de continuar.',
            );

        const row = normalizeInventoryRow(result.material);
        return {
            id: row.entityId,
            title: [
                row.name,
                row.base != null && row.height != null ? `${row.base} × ${row.height}` : '',
                row.presentation,
            ]
                .filter(Boolean)
                .join(' · '),
            data: result.material,
            isDisabled: !row.isActive,
        };
    },
};
