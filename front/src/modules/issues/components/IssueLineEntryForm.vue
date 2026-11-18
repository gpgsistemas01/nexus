<script setup lang="ts">
import { computed } from 'vue';
import { isRecord } from '../../../shared/utils/isRecord.js';
import DetailEntryRow from '../../../shared/components/DetailEntryRow.vue';
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import { isPiecePresentation } from '@nexus/piece-quantity';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupItem, LookupState } from '../../../shared/lookup.js';

const props = defineProps<{
    columns: string[];
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
const supplierName = computed(() => {
    const supplier = props.selected?.data.supplier;
    return isRecord(supplier) ? String(supplier.tradeName ?? '') : '';
});
</script>

<template>
    <DetailEntryRow
        :columns="columns"
        :selected="selected"
        @keydown.enter.prevent="!isDisabled && emit('add')"
    >
        <template #name="{ article }">
            <RemoteSelect
                :label="label"
                :model-value="values.itemId"
                :state="state"
                :initial-option="selected"
                :selected-title="String(article.name ?? '')"
                :error="errors.itemId"
                :is-disabled="isDisabled"
                @update:model-value="emit('update', 'itemId', $event)"
                @blur="emit('blur', 'itemId')"
                @search="emit('search', $event)"
                @more="emit('more')"
                @retry="emit('retry')"
            />
            <small
                v-if="supplierName"
                class="d-block text-medium-emphasis"
            >
                {{ supplierName }}
            </small>
        </template>
        <template #quantity>
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
        </template>
        <template #presentation>
            <VTextField
                label="Presentación"
                :model-value="presentation"
                readonly
                tabindex="-1"
            />
        </template>
        <template #actions>
            <VBtn
                block
                prepend-icon="$plus"
                variant="outlined"
                :disabled="isDisabled"
                @click="emit('add')"
            >
                Agregar
            </VBtn>
        </template>
    </DetailEntryRow>
</template>
