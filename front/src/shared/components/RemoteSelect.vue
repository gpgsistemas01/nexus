<script setup lang="ts">
import { VAutocomplete } from 'vuetify/components/VAutocomplete';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/components/VProgressCircular';
import { Intersect as vIntersect } from 'vuetify/directives/intersect';
import { computed, ref, toRef, watch } from 'vue';
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
        selectedTitle?: string;
    }>(),
    {
        state: () => ({ items: [], isLoading: false, error: '', hasMore: false }),
        error: undefined,
        hint: undefined,
        initialOption: undefined,
        createLabel: undefined,
        selectedTitle: undefined,
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
const searchTerm = computed(() => search.value.trim());
const createButton = ref<{ $el: HTMLElement }>();
let pendingCreateSearch: string | undefined;
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
const canRequestCreation = computed(
    () => !!props.createLabel && !!searchTerm.value && !props.isDisabled,
);
const canCreate = computed(() => {
    if (!canRequestCreation.value || props.state.isLoading || props.state.error) return false;

    const normalizedTerm = searchTerm.value.toLocaleLowerCase();
    return !visibleItems.value.some(
        (item) => item.title.trim().toLocaleLowerCase() === normalizedTerm,
    );
});
const inputHint = computed(() => {
    if (props.hint) return props.hint;

    if (canCreate.value && isMenuOpen.value) return 'Presiona Enter para abrir el registro.';

    return props.createLabel ? 'Escribe el nombre para buscar o registrar.' : undefined;
});

const createRecord = () => {
    if (!canCreate.value) return;

    pendingCreateSearch = undefined;
    isMenuOpen.value = false;
    emit('create', searchTerm.value);
};

const onInputKeydown = (event: KeyboardEvent) => {
    if (!(event.target instanceof HTMLInputElement) || !isMenuOpen.value || event.isComposing)
        return;

    if (event.key === 'Enter' && (canCreate.value || props.state.isLoading)) {
        event.preventDefault();
        event.stopPropagation();
        if (canCreate.value) createRecord();
        else if (canRequestCreation.value) pendingCreateSearch = search.value;
    } else if (
        event.key === 'ArrowDown' &&
        canCreate.value &&
        !visibleItems.value.some((item) => !item.isDisabled)
    ) {
        event.preventDefault();
        event.stopPropagation();
        createButton.value?.$el.focus();
    }
};

watch(
    () => props.state.isLoading,
    (isLoading) => {
        if (isLoading || pendingCreateSearch === undefined) return;

        const confirmedSearch = pendingCreateSearch;
        pendingCreateSearch = undefined;
        if (isMenuOpen.value && search.value === confirmedSearch) createRecord();
    },
);

const updateValue = (value: string | null) => {
    currentItem.value = visibleItems.value.find((item) => item.id === value);
    emit('update:modelValue', value ?? '');
};

const searchOptions = (value: string) => {
    if (value !== search.value) pendingCreateSearch = undefined;

    search.value = value;
    if (isMenuOpen.value && value !== currentItem.value?.title) emit('search', value);
};

const updateMenu = (isOpen: boolean) => {
    if (!isOpen) pendingCreateSearch = undefined;

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
        :search="search"
        :label="label"
        :model-value="modelValue || null"
        :items="visibleItems"
        item-title="title"
        item-value="id"
        :item-props="(item) => ({ disabled: item.isDisabled === true })"
        :loading="state.isLoading"
        :disabled="isDisabled"
        :hint="inputHint"
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
        @keydown.capture="onInputKeydown"
        @keydown.enter.stop
        @update:model-value="updateValue"
        @update:search="searchOptions($event ?? '')"
        @update:menu="updateMenu"
        @blur="emit('blur')"
    >
        <template
            v-if="selectedTitle"
            #selection
        >
            <span
                class="selected-option"
                :title="selectedTitle"
            >
                {{ selectedTitle }}
            </span>
        </template>
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
                ref="createButton"
                variant="tonal"
                size="small"
                block
                prepend-icon="$plus"
                class="create-option"
                @click.stop="createRecord"
                @keydown.enter.stop
            >
                {{ createLabel }} «{{ searchTerm }}»
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
.selected-option {
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
}
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
