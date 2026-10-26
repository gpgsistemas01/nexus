<script setup lang="ts">
import { VAutocomplete } from 'vuetify/components/VAutocomplete';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/components/VProgressCircular';
import { Intersect as vIntersect } from 'vuetify/directives/intersect';
import { computed, ref, toRef } from 'vue';
import { useSelectedOption } from '../composables/useSelectedOption.js';
import type { LookupItem } from '../lookup.js';

const props = defineProps<{
    label: string;
    modelValue: string;
    items: LookupItem[];
    isLoading: boolean;
    error?: string;
    loadError?: string;
    hasMore?: boolean;
    isDisabled?: boolean;
    hint?: string;
    initialOption?: LookupItem;
    createLabel?: string;
}>();
const emit = defineEmits<{
    'update:modelValue': [value: string];
    search: [value: string];
    more: [];
    retry: [];
    blur: [];
    create: [search: string];
}>();
const isMenuOpen = ref(false);
const search = ref('');
const currentItem = useSelectedOption(
    toRef(props, 'items'),
    () => props.modelValue,
    () => props.initialOption,
);
const visibleItems = computed(() =>
    currentItem.value && !props.items.some((item) => item.id === currentItem.value!.id)
        ? [currentItem.value, ...props.items]
        : props.items,
);
const canCreate = computed(
    () =>
        !!props.createLabel &&
        !!search.value.trim() &&
        !props.isDisabled &&
        !props.isLoading &&
        !props.loadError &&
        !visibleItems.value.some(
            (item) =>
                item.title.trim().toLocaleLowerCase() === search.value.trim().toLocaleLowerCase(),
        ),
);

const createRecord = () => {
    if (!canCreate.value) return;

    isMenuOpen.value = false;
    emit('create', search.value.trim());
};

const updateValue = (value: string | null) => {
    currentItem.value = visibleItems.value.find((item) => item.id === value);
    emit('update:modelValue', value ?? '');
};

const searchOptions = (value: string) => {
    search.value = value;
    if (value !== currentItem.value?.title) emit('search', value);
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
        :item-props="(item) => ({ disabled: item.isDisabled === true })"
        :loading="isLoading"
        :disabled="isDisabled"
        :hint="hint"
        :persistent-hint="!!hint && isDisabled"
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
            <VBtn
                v-if="canCreate"
                variant="text"
                size="small"
                block
                prepend-icon="$plus"
                class="create-option"
                @click.stop="createRecord"
                @keydown.enter.stop
            >
                {{ createLabel }} «{{ search.trim() }}»
            </VBtn>
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
.create-option {
    height: auto;
    min-height: 36px;
    padding-block: 0.5rem;
}
.create-option :deep(.v-btn__content) {
    white-space: normal;
    overflow-wrap: anywhere;
    text-align: left;
}
</style>
