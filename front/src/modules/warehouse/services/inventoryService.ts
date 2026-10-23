import { successCodeMessages } from '@nexus/api-success-codes';
import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { confirmMutation } from '../../../shared/http/recordContract.js';
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
                    ? successCodeMessages.CREATED_WASTE
                    : successCodeMessages.CREATED_MATERIAL
                : action === 'delete'
                  ? successCodeMessages.DELETED_MATERIAL
                  : resource === 'wastes'
                    ? successCodeMessages.UPDATED_WASTE
                    : successCodeMessages.UPDATED_MATERIAL;
        confirmMutation(
            result,
            expected,
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
