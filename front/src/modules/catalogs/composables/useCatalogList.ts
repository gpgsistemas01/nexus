import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { ApiError } from '../../../shared/http/apiError.js';
import { catalogService } from '../services/catalogService.js';
import type { CatalogEntry, CatalogName, CatalogQuery } from '../catalog.js';

export const useCatalogList = (catalog: CatalogName, onDenied: (status: number) => void) => {
    const query = reactive<CatalogQuery>({ page: 1, length: 10, search: '' });
    const rows = ref<CatalogEntry[]>([]);
    const total = ref(0);
    const isLoading = ref(false);
    const error = ref('');
    let controller: AbortController | undefined;
    let sequence = 0;
    let isDisposed = false;
    const load = async () => {
        if (isDisposed) return;
        const requestId = ++sequence;
        controller?.abort();
        const requestController = new AbortController();
        controller = requestController;
        isLoading.value = true;
        error.value = '';
        try {
            const result = await catalogService.list(
                catalog,
                { ...query },
                requestController.signal,
            );
            if (requestId !== sequence) return;
            rows.value = result.data;
            total.value = result.recordsFiltered;
            if (query.page > 1 && !rows.value.length) {
                query.page = Math.max(1, Math.ceil(total.value / query.length));
                await load();
            }
        } catch (cause) {
            if (requestId !== sequence || requestController.signal.aborted) return;
            error.value = cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.';
            if (cause instanceof ApiError && [401, 403].includes(cause.status))
                onDenied(cause.status);
        } finally {
            if (requestId === sequence) isLoading.value = false;
        }
    };
    const applyQuery = (changes: Partial<CatalogQuery>) => {
        const next = { ...query, ...changes, page: changes.page ?? 1 };
        if (
            next.search === query.search &&
            next.page === query.page &&
            next.length === query.length
        )
            return;
        Object.assign(query, next);
        void load();
    };
    onMounted(() => void load());
    onBeforeUnmount(() => {
        isDisposed = true;
        ++sequence;
        controller?.abort();
    });
    return { query, rows, total, isLoading, error, load, applyQuery };
};
