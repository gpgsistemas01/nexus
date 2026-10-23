import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { PageResult } from '../http/pageRequest.js';
import type { LookupItem, LookupState } from '../lookup.js';

export const useRemoteLookup = (
    request: (search: string, page: number, signal: AbortSignal) => Promise<PageResult<LookupItem>>,
    isEnabled: Ref<boolean>,
    dependency?: Ref<string>,
) => {
    const items = ref<LookupItem[]>([]);
    const isLoading = ref(false);
    const error = ref('');
    const search = ref('');
    const page = ref(1);
    const hasMore = ref(false);
    let recordsRead = 0;
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sequence = 0;
    let requestedPage = 1;
    let isDisposed = false;

    const resetOptions = () => {
        items.value = [];
        recordsRead = 0;
        hasMore.value = false;
        error.value = '';
        page.value = 1;
        requestedPage = 1;
    };

    const load = async (nextPage = 1) => {
        if (isDisposed) return;

        clearTimeout(timer);
        const requestId = ++sequence;
        requestedPage = nextPage;
        controller?.abort();

        if (!isEnabled.value) {
            resetOptions();
            isLoading.value = false;
            return;
        }

        const requestController = new AbortController();
        controller = requestController;
        isLoading.value = true;
        error.value = '';

        try {
            const result = await request(search.value, nextPage, requestController.signal);
            if (requestId !== sequence) return;

            const previous = nextPage === 1 ? [] : items.value;
            const seen = new Set(previous.map((item) => item.id));
            const additions = result.data.filter((item) => {
                if (seen.has(item.id)) return false;

                seen.add(item.id);
                return true;
            });
            items.value = [...previous, ...additions];
            recordsRead = (nextPage === 1 ? 0 : recordsRead) + result.data.length;
            page.value = nextPage;
            // El avance depende de las filas recibidas, aunque se repitan IDs.
            // Una página vacía termina la carga incluso si el conteo quedó desactualizado.
            hasMore.value = result.data.length > 0 && recordsRead < result.recordsFiltered;
        } catch (cause) {
            if (requestId === sequence && !requestController.signal.aborted)
                error.value =
                    cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.';
        } finally {
            if (requestId === sequence) isLoading.value = false;
        }
    };

    watch(
        [isEnabled, ...(dependency ? [dependency] : [])],
        () => {
            search.value = '';
            resetOptions();
            void load();
        },
        { immediate: true },
    );

    const updateSearch = (value: string) => {
        if (isDisposed || value === search.value) return;

        search.value = value;
        resetOptions();
        isLoading.value = false;
        clearTimeout(timer);
        // Invalidar inmediatamente, incluso durante el debounce.
        ++sequence;
        controller?.abort();
        timer = setTimeout(() => {
            void load();
        }, 250);
    };

    onBeforeUnmount(() => {
        isDisposed = true;
        ++sequence;
        clearTimeout(timer);
        controller?.abort();
        isLoading.value = false;
    });
    const state = computed<LookupState>(() => ({
        items: items.value,
        isLoading: isLoading.value,
        error: error.value,
        hasMore: hasMore.value,
    }));
    return {
        state,
        items,
        isLoading,
        error,
        search,
        hasMore,
        updateSearch,
        loadMore: () => {
            if (!isLoading.value && !error.value && hasMore.value) return load(page.value + 1);
        },
        retry: () => load(requestedPage),
    };
};
