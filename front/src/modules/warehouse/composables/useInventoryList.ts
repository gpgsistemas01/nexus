import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { ApiError } from '../../../shared/http/apiError.js';
import { inventoryService } from '../services/inventoryService.js';
import { useRemoteOptions } from './useRemoteOptions.js';
import type { InventoryQuery, InventoryResource, InventoryRow } from '../inventory.js';

const REFRESH_INTERVAL_MS = 30_000;

export const useInventoryList = (options: {
    resource: InventoryResource;
    canRead: boolean;
    canReadSuppliers: boolean;
    isPaused: Ref<boolean>;
    onUnauthorized: () => void;
}) => {
    const { resource, canRead, canReadSuppliers, isPaused, onUnauthorized } = options;
    const query = reactive<InventoryQuery>({
        search: '',
        supplierId: '',
        page: 1,
        length: 10,
        direction: 'asc',
        orderColumn: 0,
    });
    const rows = ref<InventoryRow[]>([]);
    const total = ref(0);
    const isLoading = ref(false);
    const isRefreshing = ref(false);
    const error = ref('');
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => canReadSuppliers),
    );
    let controller: AbortController | null = null;
    let sequence = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    let lastAttemptAt = -Infinity;
    let isDisposed = false;
    const fetchList = async (isBackground: boolean) => {
        if (!canRead || isDisposed) return;
        const requestId = ++sequence;
        controller?.abort();
        const requestController = new AbortController();
        controller = requestController;
        lastAttemptAt = Date.now();
        isLoading.value = !isBackground;
        isRefreshing.value = isBackground;
        error.value = '';
        try {
            const result = await inventoryService.list(
                resource,
                { ...query },
                requestController.signal,
            );
            if (requestId !== sequence) return;
            // Conservar la referencia evita renderizar otra vez una página sin cambios.
            if (JSON.stringify(rows.value) !== JSON.stringify(result.data))
                rows.value = result.data;
            total.value = result.recordsFiltered;
            if (query.page > 1 && !result.data.length) {
                query.page = Math.max(1, query.page - 1);
                await fetchList(isBackground);
            }
        } catch (cause) {
            if (requestId !== sequence || requestController.signal.aborted) return;
            error.value =
                cause instanceof Error ? cause.message : 'No se pudo cargar el inventario.';
            if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
        } finally {
            if (requestId === sequence) {
                isLoading.value = false;
                isRefreshing.value = false;
            }
        }
    };
    const load = () => fetchList(false);
    const applyQuery = (changes: Partial<InventoryQuery>) => {
        const next = { ...changes, page: changes.page ?? 1 };
        if (
            !Object.entries(next).some(
                ([key, value]) => query[key as keyof InventoryQuery] !== value,
            )
        )
            return;
        Object.assign(query, next);
        void load();
    };
    const refreshVisible = () => {
        if (
            document.visibilityState === 'visible' &&
            !isPaused.value &&
            !isLoading.value &&
            !isRefreshing.value &&
            Date.now() - lastAttemptAt >= REFRESH_INTERVAL_MS
        )
            void fetchList(true);
    };
    onMounted(() => {
        void load();
        window.addEventListener('focus', refreshVisible);
        document.addEventListener('visibilitychange', refreshVisible);
        interval = setInterval(refreshVisible, REFRESH_INTERVAL_MS);
    });
    onBeforeUnmount(() => {
        ++sequence;
        isDisposed = true;
        controller?.abort();
        clearInterval(interval);
        window.removeEventListener('focus', refreshVisible);
        document.removeEventListener('visibilitychange', refreshVisible);
    });
    return { query, rows, total, isLoading, isRefreshing, error, suppliers, load, applyQuery };
};
