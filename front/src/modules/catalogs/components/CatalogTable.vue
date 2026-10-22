<script setup lang="ts">
import { computed } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VChip } from 'vuetify/components/VChip';
import ServerTable from '../../../shared/components/ServerTable.vue';
import type { CatalogEntry, CatalogQuery } from '../catalog.js';

const props = defineProps<{
    rows: CatalogEntry[];
    total: number;
    query: CatalogQuery;
    isLoading: boolean;
    hasSymbol: boolean;
}>();
const emit = defineEmits<{ edit: [row: CatalogEntry]; query: [query: Partial<CatalogQuery>] }>();
const headers = computed(() => [
    { title: 'Nombre', key: 'name', sortable: false },
    ...(props.hasSymbol ? [{ title: 'Símbolo', key: 'symbol', sortable: false }] : []),
    { title: 'Activo', key: 'isActive', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false },
]);
</script>

<template>
    <ServerTable
        :headers="headers"
        :rows="rows"
        :total="total"
        :page="query.page"
        :page-size="query.length"
        :is-loading="isLoading"
        @options="emit('query', { page: $event.page, length: $event.itemsPerPage })"
    >
        <template #[`item.isActive`]="{ item }">
            <VChip
                :color="item.isActive ? 'primary' : 'filter-clear'"
                size="small"
                variant="tonal"
            >
                {{ item.isActive ? 'Sí' : 'No' }}
            </VChip>
        </template>
        <template #[`item.actions`]="{ item }">
            <VBtn
                color="filter-action"
                variant="tonal"
                size="small"
                prepend-icon="$edit"
                aria-label="Editar registro"
                @click="emit('edit', item)"
            >
                Editar
            </VBtn>
        </template>
    </ServerTable>
</template>
