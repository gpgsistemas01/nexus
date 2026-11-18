import { successCodeMessages } from '@nexus/api-success-codes';
import { apiClient } from '../../../shared/http/apiClient.js';
import { API_PATHS } from '../../../shared/http/apiPaths.js';
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
import { mapMaterialOption } from '../../../shared/utils/mapMaterialOption.js';
import { isRecord } from '../../../shared/utils/isRecord.js';

export const inventoryService = {
    async list(resource: InventoryResource, query: InventoryQuery, signal?: AbortSignal) {
        const page = await requestPage(
            `${API_PATHS.inventory[resource]}?${inventoryParams(query)}`,
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
            `${API_PATHS.inventory[resource]}${suffix}`,
            {
                method,
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

        return mapMaterialOption(
            result.material,
            resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE',
        );
    },
};
