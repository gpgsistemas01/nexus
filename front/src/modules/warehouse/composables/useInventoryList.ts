import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import type { Ref } from 'vue';
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
    const error = ref('');
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => canReadSuppliers),
    );
    let controller: AbortController | null = null;
    let sequence = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const load = async () => {
        if (!canRead) return;
        const requestId = ++sequence;
        controller?.abort();
        controller = new AbortController();
        isLoading.value = true;
        error.value = '';
        try {
            const result = await inventoryService.list(resource, { ...query }, controller.signal);
            if (requestId !== sequence) return;
            rows.value = result.data;
            total.value = result.recordsFiltered;
            if (query.page > 1 && !result.data.length) {
                query.page = Math.max(1, query.page - 1);
                await load();
            }
        } catch (cause) {
            if (requestId !== sequence || controller.signal.aborted) return;
            error.value =
                cause instanceof Error ? cause.message : 'No se pudo cargar el inventario.';
            if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
        } finally {
            if (requestId === sequence) isLoading.value = false;
        }
    };
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
        if (document.visibilityState === 'visible' && !isPaused.value && !isLoading.value)
            void load();
    };
    onMounted(() => {
        void load();
        window.addEventListener('focus', refreshVisible);
        interval = setInterval(refreshVisible, 30_000);
    });
    onBeforeUnmount(() => {
        ++sequence;
        controller?.abort();
        clearInterval(interval);
        window.removeEventListener('focus', refreshVisible);
    });
    return { query, rows, total, isLoading, error, suppliers, load, applyQuery };
};
