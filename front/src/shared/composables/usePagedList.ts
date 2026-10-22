import { onBeforeUnmount, onMounted, shallowReactive, shallowRef, ref } from 'vue';
import type { PageResult } from '../http/pageRequest.js';

interface PageQuery {
    page: number;
    length: number;
}

export const usePagedList = <Query extends PageQuery, Row>(options: {
    initialQuery: Query;
    request: (query: Query, signal: AbortSignal) => Promise<PageResult<Row>>;
    errorMessage: string;
    canLoad?: () => boolean;
    onError: (cause: unknown) => void;
}) => {
    const query = shallowReactive(options.initialQuery);
    const rows = shallowRef<Row[]>([]);
    const total = ref(0);
    const isLoading = ref(false);
    const isRefreshing = ref(false);
    const error = ref('');
    let controller: AbortController | undefined;
    let sequence = 0;
    let isDisposed = false;

    const fetchPage = async (isBackground: boolean) => {
        if (isDisposed || options.canLoad?.() === false) return;

        const requestId = ++sequence;
        controller?.abort();
        const requestController = new AbortController();
        controller = requestController;
        isLoading.value = !isBackground;
        isRefreshing.value = isBackground;
        error.value = '';

        try {
            const result = await options.request({ ...query }, requestController.signal);
            if (requestId !== sequence) return;

            // Los DTOs de las listas son datos JSON; conservarlos evita redibujos sin cambios.
            if (JSON.stringify(rows.value) !== JSON.stringify(result.data)) {
                rows.value = result.data;
            }

            total.value = result.recordsFiltered;

            if (query.page > 1 && !result.data.length) {
                query.page = Math.min(
                    query.page - 1,
                    Math.max(1, Math.ceil(total.value / query.length)),
                );
                await fetchPage(isBackground);
            }
        } catch (cause) {
            if (requestId !== sequence || requestController.signal.aborted) return;

            error.value = cause instanceof Error ? cause.message : options.errorMessage;
            options.onError(cause);
        } finally {
            if (requestId === sequence) {
                isLoading.value = false;
                isRefreshing.value = false;
            }
        }
    };

    const load = () => fetchPage(false);

    const refresh = () => fetchPage(true);

    const applyQuery = (changes: Partial<Query>) => {
        const next = { ...changes, page: changes.page ?? 1 };

        if (!Object.entries(next).some(([key, value]) => query[key as keyof Query] !== value)) {
            return;
        }

        Object.assign(query, next);
        void load();
    };

    onMounted(() => void load());
    onBeforeUnmount(() => {
        isDisposed = true;
        ++sequence;
        controller?.abort();
    });

    return { query, rows, total, isLoading, isRefreshing, error, load, refresh, applyQuery };
};
