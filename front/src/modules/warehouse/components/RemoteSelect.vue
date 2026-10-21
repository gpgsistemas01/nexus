<script setup lang="ts">
import { VAutocomplete } from 'vuetify/components/VAutocomplete';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/components/VProgressCircular';
import { Intersect as vIntersect } from 'vuetify/directives/intersect';
import { computed, ref, shallowRef, watch } from 'vue';
import type { LookupItem } from '../inventory.js';

const props = defineProps<{
    label: string;
    modelValue: string;
    items: LookupItem[];
    isLoading: boolean;
    error?: string;
    loadError?: string;
    hasMore?: boolean;
    isDisabled?: boolean;
}>();
const emit = defineEmits<{
    'update:modelValue': [value: string];
    search: [value: string];
    more: [];
    retry: [];
    blur: [];
}>();
const isMenuOpen = ref(false);
const selectedItem = shallowRef<LookupItem>();
watch(
    [() => props.modelValue, () => props.items],
    () => {
        selectedItem.value =
            props.items.find((item) => item.id === props.modelValue) ??
            (selectedItem.value?.id === props.modelValue ? selectedItem.value : undefined);
    },
    { immediate: true },
);
const visibleItems = computed(() =>
    selectedItem.value && !props.items.some((item) => item.id === selectedItem.value!.id)
        ? [selectedItem.value, ...props.items]
        : props.items,
);
const updateValue = (value: string | null) => {
    selectedItem.value = visibleItems.value.find((item) => item.id === value);
    emit('update:modelValue', value ?? '');
};
const searchOptions = (value: string) => {
    if (value !== selectedItem.value?.title) emit('search', value);
};
const loadWhenVisible = (isVisible: boolean) => {
    if (
        isVisible &&
        isMenuOpen.value &&
        props.hasMore &&
        !props.isLoading &&
        !props.loadError &&
        !props.isDisabled
    )
        emit('more');
};
</script>

<template>
    <VAutocomplete
        v-model:menu="isMenuOpen"
        :label="label"
        :model-value="modelValue || null"
        :items="visibleItems"
        item-title="title"
        item-value="id"
        :loading="isLoading"
        :disabled="isDisabled"
        :error-messages="error || loadError"
        :aria-label="label"
        :aria-invalid="!!error || !!loadError"
        :menu-props="{ maxHeight: 280 }"
        variant="outlined"
        density="compact"
        no-filter
        clearable
        no-data-text="No hay resultados. Escribe para buscar."
        @update:model-value="updateValue"
        @update:search="searchOptions($event ?? '')"
        @blur="emit('blur')"
    >
        <template #no-data>
            <div
                class="catalog-status"
                role="status"
            >
                <span>
                    {{
                        isLoading
                            ? 'Cargando opciones…'
                            : loadError
                              ? 'No se pudo cargar el catálogo.'
                              : 'No hay resultados.'
                    }}
                </span>
                <VBtn
                    v-if="loadError"
                    variant="text"
                    @click.stop="emit('retry')"
                >
                    Reintentar catálogo
                </VBtn>
            </div>
        </template>
        <template #append-item>
            <div
                v-if="hasMore"
                :key="items.length"
                v-intersect="loadWhenVisible"
                class="catalog-status"
                role="status"
            >
                <VProgressCircular
                    v-if="isLoading"
                    indeterminate
                    size="18"
                    width="2"
                />
                <VBtn
                    v-else-if="loadError"
                    variant="text"
                    @click.stop="emit('retry')"
                >
                    Reintentar catálogo
                </VBtn>
                <span v-else>Desplázate para cargar más opciones</span>
            </div>
        </template>
    </VAutocomplete>
</template>

<style scoped>
.catalog-status {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    color: #54705f;
    font-size: 0.8rem;
}
</style>
