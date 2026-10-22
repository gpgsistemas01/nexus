import { shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import type { LookupItem } from '../lookup.js';

// Una búsqueda paginada puede reemplazar las opciones sin cambiar la selección.
export const useSelectedOption = (items: Ref<LookupItem[]>, getId: () => string) => {
    const selected = shallowRef<LookupItem>();
    watch(
        [items, getId],
        () => {
            const id = getId();
            selected.value =
                items.value.find((item) => item.id === id) ??
                (selected.value?.id === id ? selected.value : undefined);
        },
        { immediate: true },
    );
    return selected;
};
