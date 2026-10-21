<script setup lang="ts">
import { VAutocomplete } from 'vuetify/components/VAutocomplete';
import { VBtn } from 'vuetify/components/VBtn';
import { computed, shallowRef, watch } from 'vue';
import type { LookupItem } from '../inventory.js';

const props = defineProps<{
    label: string;
    modelValue: string;
    items: LookupItem[];
    isLoading: boolean;
    error?: string;
    hasMore?: boolean;
    isDisabled?: boolean;
}>();
const emit = defineEmits<{
    'update:modelValue': [value: string];
    search: [value: string];
    more: [];
    blur: [];
}>();
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
</script>

<template>
    <div>
        <VAutocomplete
            :label="label"
            :model-value="modelValue || null"
            :items="visibleItems"
            item-title="title"
            item-value="id"
            :loading="isLoading"
            :disabled="isDisabled"
            :error-messages="error"
            :aria-label="label"
            :aria-invalid="!!error"
            variant="outlined"
            density="comfortable"
            no-filter
            clearable
            no-data-text="Escribe para buscar; si falla, vuelve a intentarlo."
            @update:model-value="emit('update:modelValue', $event ?? '')"
            @update:search="emit('search', $event ?? '')"
            @blur="emit('blur')"
        >
            <template #append-item>
                <VBtn
                    v-if="hasMore"
                    variant="text"
                    block
                    :loading="isLoading"
                    @click.stop="emit('more')"
                    >Cargar más opciones</VBtn
                >
            </template>
        </VAutocomplete>
    </div>
</template>
