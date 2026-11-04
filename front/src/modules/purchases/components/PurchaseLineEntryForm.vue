<script setup lang="ts">
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupItem, LookupState } from '../../../shared/lookup.js';

defineProps<{
    itemLabel: string;
    values: { materialId: string; quantity: string; costPerUnitType: string };
    errors: Partial<Record<'materialId' | 'quantity' | 'costPerUnitType', string>>;
    items: LookupState;
    selected?: LookupItem;
    presentation: string;
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
}>();
</script>

<template>
    <section
        aria-label="Agregar detalle"
        class="purchase-entry"
        @keydown.enter.prevent="!isDisabled && canRead && emit('add')"
    >
        <h3>Agregar detalle</h3>
        <VRow class="mt-1">
            <VCol cols="12">
                <RemoteSelect
                    :label="itemLabel"
                    :model-value="values.materialId"
                    :state="items"
                    :error="errors.materialId"
                    :initial-option="selected"
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
            </VCol>
            <VCol
                cols="12"
                md="2"
                lg="3"
            >
                <VTextField
                    label="Cantidad"
                    type="number"
                    min="1"
                    step="0.01"
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
            >
                <VTextField
                    label="Costo por Presentación"
                    type="number"
                    min="0"
                    step="0.000001"
                    :model-value="values.costPerUnitType"
                    :error-messages="errors.costPerUnitType"
                    :disabled="isDisabled"
                    @update:model-value="emit('update', 'costPerUnitType', $event ?? '')"
                    @blur="emit('blur', 'costPerUnitType')"
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
                    variant="outlined"
                    prepend-icon="$plus"
                    :disabled="isDisabled || !canRead"
                    @click="emit('add')"
                >
                    Agregar
                </VBtn>
            </VCol>
        </VRow>
    </section>
</template>

<style scoped>
.purchase-entry {
    border: 1px solid rgba(var(--v-theme-primary), 0.2);
    border-radius: 0.75rem;
    padding: 1rem;
}
.purchase-entry h3 {
    font-size: 1rem;
    color: rgb(var(--v-theme-primary));
}
</style>
