import { computed } from 'vue';
import type { Ref } from 'vue';
import { useVisibleRefresh } from '../../../shared/composables/useVisibleRefresh.js';
import { usePagedList } from '../../../shared/composables/usePagedList.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { inventoryService } from '../services/inventoryService.js';
import { useRemoteOptions } from './useRemoteOptions.js';
import type { InventoryQuery, InventoryResource, InventoryRow } from '../inventory.js';

export const useInventoryList = (options: {
    resource: InventoryResource;
    canRead: boolean;
    canReadSuppliers: boolean;
    isPaused: Ref<boolean>;
    onUnauthorized: () => void;
}) => {
    const { resource, canRead, canReadSuppliers, isPaused, onUnauthorized } = options;
    let lastAttemptAt = -Infinity;
    const list = usePagedList<InventoryQuery, InventoryRow>({
        initialQuery: {
            search: '',
            supplierId: '',
            page: 1,
            length: 10,
            direction: 'asc',
            orderColumn: 0,
        },
        canLoad: () => canRead,
        request: (query, signal) => {
            lastAttemptAt = Date.now();
            return inventoryService.list(resource, query, signal);
        },
        errorMessage: 'No se pudo cargar el inventario.',
        onError: (cause) => {
            if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
        },
    });
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => canReadSuppliers),
    );
    useVisibleRefresh({
        refresh: list.refresh,
        lastAttemptAt: () => lastAttemptAt,
        canRefresh: () =>
            canRead && !isPaused.value && !list.isLoading.value && !list.isRefreshing.value,
    });

    return { ...list, suppliers };
};
