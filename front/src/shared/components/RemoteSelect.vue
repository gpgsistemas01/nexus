<script setup lang="ts">
import { VAutocomplete } from 'vuetify/components/VAutocomplete';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/components/VProgressCircular';
import { Intersect as vIntersect } from 'vuetify/directives/intersect';
import { computed, ref, toRef } from 'vue';
import { useSelectedOption } from '../composables/useSelectedOption.js';
import type { LookupItem, LookupState } from '../lookup.js';

const props = withDefaults(
    defineProps<{
        label: string;
        modelValue: string;
        state?: LookupState;
        error?: string;
        isDisabled?: boolean;
        hint?: string;
        initialOption?: LookupItem;
        createLabel?: string;
    }>(),
    {
        state: () => ({ items: [], isLoading: false, error: '', hasMore: false }),
        error: undefined,
        hint: undefined,
        initialOption: undefined,
        createLabel: undefined,
    },
);
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
    toRef(() => props.state.items),
    () => props.modelValue,
    () => props.initialOption,
);
const visibleItems = computed(() =>
    currentItem.value && !props.state.items.some((item) => item.id === currentItem.value!.id)
        ? [currentItem.value, ...props.state.items]
        : props.state.items,
);
const canCreate = computed(
    () =>
        !!props.createLabel &&
        !!search.value.trim() &&
        !props.isDisabled &&
        !props.state.isLoading &&
        !props.state.error &&
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
    if (isMenuOpen.value && value !== currentItem.value?.title) emit('search', value);
};

const updateMenu = (isOpen: boolean) => {
    isMenuOpen.value = isOpen;
    if (isOpen && !props.isDisabled)
        emit('search', search.value === currentItem.value?.title ? '' : search.value);
};

const loadWhenVisible = (isVisible: boolean) => {
    if (
        isVisible &&
        isMenuOpen.value &&
        props.state.hasMore &&
        !props.state.isLoading &&
        !props.state.error &&
        !props.isDisabled
    )
        emit('more');
};
</script>

<template>
    <VAutocomplete
        :menu="isMenuOpen"
        :label="label"
        :model-value="modelValue || null"
        :items="visibleItems"
        item-title="title"
        item-value="id"
        :item-props="(item) => ({ disabled: item.isDisabled === true })"
        :loading="state.isLoading"
        :disabled="isDisabled"
        :hint="hint"
        :persistent-hint="!!hint && isDisabled"
        :error-messages="error || state.error"
        :aria-label="label"
        :aria-invalid="!!error || !!state.error"
        :menu-props="{ maxHeight: 280 }"
        variant="outlined"
        density="compact"
        no-filter
        clearable
        no-data-text="No hay resultados. Escribe para buscar."
        @update:model-value="updateValue"
        @update:search="searchOptions($event ?? '')"
        @update:menu="updateMenu"
        @blur="emit('blur')"
    >
        <template #no-data>
            <div
                class="catalog-status"
                role="status"
            >
                <span>
                    {{
                        state.isLoading
                            ? 'Cargando opciones…'
                            : state.error
                              ? 'No se pudo cargar el catálogo.'
                              : 'No hay resultados.'
                    }}
                </span>
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
                v-if="state.error && state.canRetry !== false"
                class="catalog-status"
            >
                <VBtn
                    variant="text"
                    @click.stop="emit('retry')"
                >
                    Reintentar catálogo
                </VBtn>
            </div>
            <div
                v-else-if="state.hasMore && !state.error"
                :key="state.items.length"
                v-intersect="loadWhenVisible"
                class="catalog-status"
                role="status"
            >
                <VProgressCircular
                    v-if="state.isLoading"
                    indeterminate
                    size="18"
                    width="2"
                />
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
