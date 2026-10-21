import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { inventoryService } from '../services/inventoryService.js';
import type { LookupItem } from '../inventory.js';

export const useRemoteOptions = (
    path: string,
    isEnabled: Ref<boolean>,
    supplierId?: Ref<string>,
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
    const load = async (nextPage = 1) => {
        const requestId = ++sequence;
        controller?.abort();
        if (!isEnabled.value || (supplierId && !supplierId.value)) {
            items.value = [];
            total.value = 0;
            isLoading.value = false;
            return;
        }
        controller = new AbortController();
        isLoading.value = true;
        error.value = '';
        try {
            const result = await inventoryService.lookup(
                path,
                search.value,
                nextPage,
                supplierId?.value,
                controller.signal,
            );
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
        [isEnabled, ...(supplierId ? [supplierId] : [])],
        () => {
            search.value = '';
            void load();
        },
        { immediate: true },
    );
    const updateSearch = (value: string) => {
        search.value = value;
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
        loadMore: () => load(page.value + 1),
    };
};
