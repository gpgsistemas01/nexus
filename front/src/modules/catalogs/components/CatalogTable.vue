<script setup lang="ts">
import { computed } from 'vue';
import TableAction from '../../../shared/components/TableAction.vue';
import StateBadge from '../../../shared/components/StateBadge.vue';
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
            <StateBadge :is-active="item.isActive" />
        </template>
        <template #[`item.actions`]="{ item }">
            <TableAction
                icon="$edit"
                label="Editar registro"
                @click="emit('edit', item)"
            />
        </template>
    </ServerTable>
</template>
