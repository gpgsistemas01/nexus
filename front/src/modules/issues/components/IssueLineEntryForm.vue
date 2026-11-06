<script setup lang="ts">
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import { isPiecePresentation } from '@nexus/piece-quantity';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupItem, LookupState } from '../../../shared/lookup.js';

defineProps<{
    label: string;
    values: { itemId: string; quantity: string };
    errors: Partial<Record<'itemId' | 'quantity', string>>;
    state: LookupState;
    selected?: LookupItem;
    presentation: string;
    isDisabled: boolean;
    minimum: string;
}>();
const emit = defineEmits<{
    update: [field: 'itemId' | 'quantity', value: string];
    blur: [field: 'itemId' | 'quantity'];
    search: [value: string];
    more: [];
    retry: [];
    add: [];
}>();
</script>

<template>
    <section
        aria-label="Agregar detalle"
        class="issue-entry"
        @keydown.enter.prevent="!isDisabled && emit('add')"
    >
        <h3>Agregar detalle</h3>
        <VRow class="mt-1">
            <VCol cols="12">
                <RemoteSelect
                    :label="label"
                    :model-value="values.itemId"
                    :state="state"
                    :initial-option="selected"
                    :error="errors.itemId"
                    :is-disabled="isDisabled"
                    @update:model-value="emit('update', 'itemId', $event)"
                    @blur="emit('blur', 'itemId')"
                    @search="emit('search', $event)"
                    @more="emit('more')"
                    @retry="emit('retry')"
                />
            </VCol>
            <VCol
                cols="12"
                md="6"
                lg="7"
            >
                <VTextField
                    label="Cantidad"
                    type="number"
                    :min="isPiecePresentation(presentation) ? 1 : minimum"
                    :step="isPiecePresentation(presentation) ? 1 : 0.01"
                    :model-value="values.quantity"
                    :error-messages="errors.quantity"
                    :disabled="isDisabled"
                    @update:model-value="emit('update', 'quantity', $event ?? '')"
                    @blur="emit('blur', 'quantity')"
                />
            </VCol>
            <VCol
                cols="12"
                md="4"
                lg="3"
            >
                <VTextField
                    label="Presentación"
                    :model-value="presentation"
                    readonly
                    tabindex="-1"
                />
            </VCol>
            <VCol
                cols="12"
                md="2"
                class="d-flex align-center"
            >
                <VBtn
                    block
                    prepend-icon="$plus"
                    variant="outlined"
                    :disabled="isDisabled"
                    @click="emit('add')"
                >
                    Agregar
                </VBtn>
            </VCol>
        </VRow>
    </section>
</template>

<style scoped>
.issue-entry {
    padding: 1rem;
    border: 1px solid rgba(var(--v-theme-primary), 0.2);
    border-radius: 0.75rem;
}
h3 {
    font-size: 1rem;
    color: rgb(var(--v-theme-primary));
}
</style>
