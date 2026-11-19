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
    isMaterial?: boolean;
}>();
const emit = defineEmits<{
    edit: [row: CatalogEntry];
    remove: [row: CatalogEntry];
    query: [query: Partial<CatalogQuery>];
}>();
const headers = computed(() => [
    { title: 'Nombre', key: 'name', sortable: false },
    ...(props.hasSymbol ? [{ title: 'Símbolo', key: 'symbol', sortable: false }] : []),
    ...(props.isMaterial
        ? [
              { title: 'Tipo', key: 'type', sortable: false },
              { title: 'Presentación', key: 'presentation', sortable: false },
              { title: 'Unidad de medida', key: 'unitSymbol', sortable: false },
              { title: 'Base', key: 'base', sortable: false },
              { title: 'Altura', key: 'height', sortable: false },
              { title: 'Stock mínimo', key: 'minStock', sortable: false },
          ]
        : [{ title: 'Activo', key: 'isActive', sortable: false }]),
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
        :format-value="
            (row, key) =>
                key === 'type'
                    ? row.type === 'CONSUMABLE'
                        ? 'Consumible'
                        : 'Material'
                    : String(row[key as keyof CatalogEntry] ?? '—')
        "
        @options="emit('query', { page: $event.page, length: $event.itemsPerPage })"
    >
        <template #[`item.type`]="{ item }">
            {{ item.type === 'CONSUMABLE' ? 'Consumible' : 'Material' }}
        </template>
        <template #[`item.base`]="{ item }">{{ item.base || '—' }}</template>
        <template #[`item.height`]="{ item }">{{ item.height || '—' }}</template>
        <template #[`item.isActive`]="{ item }">
            <StateBadge :is-active="item.isActive === true" />
        </template>
        <template #[`item.actions`]="{ item }">
            <TableAction
                icon="$edit"
                label="Editar registro"
                @click="emit('edit', item)"
            />
            <TableAction
                v-if="isMaterial && item.hasSuppliers === false && !item.hasHistory"
                color="error"
                icon="$delete"
                label="Eliminar artículo"
                @click="emit('remove', item)"
            />
        </template>
    </ServerTable>
</template>
