<script setup lang="ts">
import DetailEntryRow from '../../../shared/components/DetailEntryRow.vue';
import { VTextField } from 'vuetify/components/VTextField';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VBtn } from 'vuetify/components/VBtn';
import { DECIMAL_INPUT_FORMAT } from '@nexus/input-validation';
import { isPiecePresentation } from '@nexus/piece-quantity';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupItem, LookupState } from '../../../shared/lookup.js';

defineProps<{
    columns: string[];
    itemLabel: string;
    values: { materialId: string; quantity: string; costPerUnitType: string };
    errors: Partial<Record<'materialId' | 'quantity' | 'costPerUnitType', string>>;
    items: LookupState;
    selected?: LookupItem;
    presentation: string;
    costIsTotal?: boolean;
    automaticTotalCost?: boolean;
    isDisabled: boolean;
    canRead: boolean;
    canCreate: boolean;
}>();
const emit = defineEmits<{
    update: [field: 'materialId' | 'quantity' | 'costPerUnitType', value: string];
    blur: [field: 'materialId' | 'quantity' | 'costPerUnitType'];
    search: [value: string];
    more: [];
    retry: [];
    create: [search: string];
    add: [];
    'update:costIsTotal': [value: boolean];
}>();
</script>

<template>
    <DetailEntryRow
        :columns="columns"
        :selected="selected"
        @keydown.enter.prevent="!isDisabled && canRead && emit('add')"
    >
        <template #name="{ article }">
            <RemoteSelect
                :label="itemLabel"
                :model-value="values.materialId"
                :state="items"
                :error="errors.materialId"
                :initial-option="selected"
                :selected-title="String(article.name ?? '')"
                :is-disabled="isDisabled || !canRead"
                :hint="!canRead ? 'Sin permiso para consultar este inventario.' : ''"
                :create-label="canCreate ? `Registrar ${itemLabel.toLowerCase()}` : undefined"
                @create="emit('create', $event)"
                @update:model-value="emit('update', 'materialId', $event)"
                @blur="emit('blur', 'materialId')"
                @search="emit('search', $event)"
                @more="emit('more')"
                @retry="emit('retry')"
            />
        </template>
        <template #quantity>
            <VTextField
                label="Cantidad"
                type="number"
                :min="isPiecePresentation(presentation) ? 1 : DECIMAL_INPUT_FORMAT.minimumPositive"
                :step="isPiecePresentation(presentation) ? 1 : 0.01"
                :model-value="values.quantity"
                :error-messages="errors.quantity"
                :disabled="isDisabled"
                @update:model-value="emit('update', 'quantity', $event ?? '')"
                @blur="emit('blur', 'quantity')"
            />
        </template>
        <template #costPerUnitType>
            <VTextField
                :label="costIsTotal ? 'Costo total del detalle sin IVA' : 'Costo por Presentación'"
                type="number"
                min="0"
                step="0.000001"
                :model-value="values.costPerUnitType"
                :error-messages="errors.costPerUnitType"
                :disabled="isDisabled"
                @update:model-value="emit('update', 'costPerUnitType', $event ?? '')"
                @blur="emit('blur', 'costPerUnitType')"
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
        <template #costScope>
            <VCheckbox
                label="Usar el costo por presentación como costo total"
                :hint="
                    automaticTotalCost
                        ? 'Automático para KILOGRAMOS y METRO LINEAL con medidas 1 × 1. Costo unitario = costo total sin IVA ÷ cantidad comprada.'
                        : 'Marque si el costo por presentación cubre toda la cantidad comprada. El costo unitario se obtiene dividiendo entre esa cantidad.'
                "
                :model-value="costIsTotal ?? false"
                :disabled="isDisabled || automaticTotalCost"
                @update:model-value="emit('update:costIsTotal', $event === true)"
            />
        </template>
        <template #actions>
            <VBtn
                block
                variant="outlined"
                prepend-icon="$plus"
                :disabled="isDisabled || !canRead"
                @click="emit('add')"
            >
                Agregar
            </VBtn>
        </template>
    </DetailEntryRow>
</template>
