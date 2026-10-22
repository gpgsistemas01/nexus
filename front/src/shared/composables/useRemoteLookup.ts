import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { PageResult } from '../http/pageRequest.js';
import type { LookupItem } from '../lookup.js';

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
    const total = ref(0);
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sequence = 0;
    let requestedPage = 1;

    const load = async (nextPage = 1) => {
        const requestId = ++sequence;
        requestedPage = nextPage;
        controller?.abort();

        if (!isEnabled.value) {
            items.value = [];
            total.value = 0;
            isLoading.value = false;
            return;
        }

        controller = new AbortController();
        isLoading.value = true;
        error.value = '';

        try {
            const result = await request(search.value, nextPage, controller.signal);
            if (requestId !== sequence) return;

            items.value =
                nextPage === 1
                    ? result.data
                    : [
                          ...items.value,
                          ...result.data.filter(
                              (item) => !items.value.some((old) => old.id === item.id),
                          ),
                      ];
            page.value = nextPage;
            total.value = result.recordsFiltered;
        } catch (cause) {
            if (requestId === sequence && !controller.signal.aborted)
                error.value =
                    cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.';
        } finally {
            if (requestId === sequence) isLoading.value = false;
        }
    };

    watch(
        [isEnabled, ...(dependency ? [dependency] : [])],
        () => {
            clearTimeout(timer);
            search.value = '';
            items.value = [];
            total.value = 0;
            page.value = 1;
            void load();
        },
        { immediate: true },
    );

    const updateSearch = (value: string) => {
        if (value === search.value) return;

        search.value = value;
        items.value = [];
        total.value = 0;
        page.value = 1;
        clearTimeout(timer);
        // Invalidar inmediatamente, incluso durante el debounce.
        ++sequence;
        controller?.abort();
        timer = setTimeout(() => {
            void load();
        }, 250);
    };

    onBeforeUnmount(() => {
        ++sequence;
        clearTimeout(timer);
        controller?.abort();
    });
    return {
        items,
        isLoading,
        error,
        search,
        hasMore: computed(() => items.value.length < total.value),
        updateSearch,
        loadMore: () => {
            if (!isLoading.value && !error.value && items.value.length < total.value)
                return load(page.value + 1);
        },
        retry: () => load(requestedPage),
    };
};
