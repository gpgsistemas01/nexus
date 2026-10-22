<script setup lang="ts">
import { VCol } from 'vuetify/components/VGrid';
import ListFilters from '../../../shared/components/ListFilters.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupState } from '../../../shared/lookup.js';

defineProps<{
    supplierId: string;
    canFilterSupplier: boolean;
    isLoading: boolean;
    suppliers: LookupState;
}>();
const emit = defineEmits<{
    supplier: [value: string];
    searchOptions: [value: string];
    more: [];
    retry: [];
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
        :has-extra-filters="canFilterSupplier"
        :has-active-filters="!!search || !!supplierId"
        @apply="emit('apply')"
        @clear="emit('clear')"
        @refresh="emit('refresh')"
    >
        <VCol
            v-if="canFilterSupplier"
            cols="12"
            md="6"
        >
            <RemoteSelect
                label="Filtrar por proveedor"
                :model-value="supplierId"
                :items="suppliers.items"
                :is-loading="suppliers.isLoading"
                :load-error="suppliers.error"
                :has-more="suppliers.hasMore"
                @update:model-value="emit('supplier', $event)"
                @search="emit('searchOptions', $event)"
                @more="emit('more')"
                @retry="emit('retry')"
            />
        </VCol>
    </ListFilters>
</template>
