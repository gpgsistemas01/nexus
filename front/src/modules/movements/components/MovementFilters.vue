<script setup lang="ts">
import { VCol } from 'vuetify/components/VGrid';
import { VSelect } from 'vuetify/components/VSelect';
import { VTextField } from 'vuetify/components/VTextField';
import { VAlert } from 'vuetify/components/VAlert';
import ListFilters from '../../../shared/components/ListFilters.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupState } from '../../../shared/lookup.js';
import { MOVEMENT_TYPES } from '../movement.js';
import type { MovementFilters } from '../movement.js';

defineProps<{
    values: MovementFilters;
    suppliers: LookupState;
    items: LookupState;
    canSelectSupplier: boolean;
    canSelectItem: boolean;
    itemLabel: string;
    isLoading: boolean;
    error: string;
}>();
const emit = defineEmits<{
    update: [field: keyof MovementFilters, value: string];
    searchOptions: [lookup: 'suppliers' | 'items', value: string];
    more: [lookup: 'suppliers' | 'items'];
    retry: [lookup: 'suppliers' | 'items'];
    apply: [];
    clear: [];
    refresh: [];
}>();
const search = defineModel<string>('search', { required: true });
</script>

<template>
    <ListFilters
        v-model:search="search"
        :is-loading="isLoading"
        has-extra-filters
        :has-active-filters="!!search || Object.values(values).some(Boolean)"
        :search-label="`Buscar por ${itemLabel.toLowerCase()}, proveedor o folio`"
        @apply="emit('apply')"
        @clear="emit('clear')"
        @refresh="emit('refresh')"
    >
        <VCol
            cols="12"
            md="6"
        >
            <VSelect
                label="Tipo de movimiento"
                :model-value="values.movementType"
                :items="MOVEMENT_TYPES"
                @update:model-value="emit('update', 'movementType', $event ?? '')"
            />
        </VCol>
        <VCol
            cols="12"
            md="6"
        >
            <RemoteSelect
                label="Proveedor"
                :model-value="values.supplierId"
                :items="suppliers.items"
                :is-loading="suppliers.isLoading"
                :has-more="suppliers.hasMore"
                :load-error="suppliers.error"
                :is-disabled="!canSelectSupplier"
                :hint="
                    !canSelectSupplier
                        ? 'Tu cuenta no tiene permiso para consultar proveedores.'
                        : ''
                "
                @update:model-value="emit('update', 'supplierId', $event)"
                @search="emit('searchOptions', 'suppliers', $event)"
                @more="emit('more', 'suppliers')"
                @retry="emit('retry', 'suppliers')"
            />
        </VCol>
        <VCol
            cols="12"
            md="6"
        >
            <RemoteSelect
                :label="itemLabel"
                :model-value="values.itemId"
                :items="items.items"
                :is-loading="items.isLoading"
                :has-more="items.hasMore"
                :load-error="items.error"
                :is-disabled="!values.supplierId || !canSelectItem"
                :hint="
                    !canSelectItem
                        ? 'Tu cuenta no tiene permiso para consultar este inventario.'
                        : !values.supplierId
                          ? 'Selecciona un proveedor primero.'
                          : ''
                "
                @update:model-value="emit('update', 'itemId', $event)"
                @search="emit('searchOptions', 'items', $event)"
                @more="emit('more', 'items')"
                @retry="emit('retry', 'items')"
            />
        </VCol>
        <VCol
            cols="12"
            md="6"
        >
            <VTextField
                label="Fecha de inicio"
                type="date"
                :model-value="values.startDate"
                :max="values.endDate || undefined"
                @update:model-value="emit('update', 'startDate', $event ?? '')"
            />
        </VCol>
        <VCol
            cols="12"
            md="6"
        >
            <VTextField
                label="Fecha de fin"
                type="date"
                :model-value="values.endDate"
                :min="values.startDate || undefined"
                @update:model-value="emit('update', 'endDate', $event ?? '')"
            />
        </VCol>
        <template #messages>
            <VAlert
                v-if="error"
                role="alert"
                type="error"
                variant="tonal"
                class="mt-3"
            >
                {{ error }}
            </VAlert>
        </template>
    </ListFilters>
</template>
