<script setup lang="ts">
import { VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VAlert } from 'vuetify/components/VAlert';
import ListFilters from '../../../shared/components/ListFilters.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupState } from '../../../shared/lookup.js';
import type { PurchaseFilters } from '../purchase.js';

defineProps<{
    values: PurchaseFilters;
    suppliers: LookupState;
    persons: LookupState;
    canSuppliers: boolean;
    canPersons: boolean;
    isLoading: boolean;
    error: string;
}>();
const emit = defineEmits<{
    update: [field: keyof PurchaseFilters, value: string];
    apply: [];
    clear: [];
    refresh: [];
    searchOptions: [kind: 'suppliers' | 'persons', value: string];
    more: [kind: 'suppliers' | 'persons'];
    retry: [kind: 'suppliers' | 'persons'];
}>();
const search = defineModel<string>('search', { required: true });
</script>

<template>
    <ListFilters
        v-model:search="search"
        :is-loading="isLoading"
        has-extra-filters
        :has-active-filters="!!search || Object.values(values).some(Boolean)"
        search-label="Buscar por Folio o N° Factura"
        @apply="emit('apply')"
        @clear="emit('clear')"
        @refresh="emit('refresh')"
    >
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
                :is-disabled="!canSuppliers"
                :hint="!canSuppliers ? 'Sin permiso para consultar proveedores.' : ''"
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
                label="Persona que recibe"
                :model-value="values.personId"
                :items="persons.items"
                :is-loading="persons.isLoading"
                :has-more="persons.hasMore"
                :load-error="persons.error"
                :is-disabled="!canPersons"
                :hint="!canPersons ? 'Sin permiso para consultar personas.' : ''"
                @update:model-value="emit('update', 'personId', $event)"
                @search="emit('searchOptions', 'persons', $event)"
                @more="emit('more', 'persons')"
                @retry="emit('retry', 'persons')"
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
                type="error"
                role="alert"
                class="mt-3"
            >
                {{ error }}
            </VAlert>
        </template>
    </ListFilters>
</template>
