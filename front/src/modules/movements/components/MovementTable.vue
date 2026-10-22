<script setup lang="ts">
import { computed } from 'vue';
import type { DataTableHeader } from 'vuetify';
import { useTableQuery } from '../../../shared/composables/useTableQuery.js';
import ServerTable from '../../../shared/components/ServerTable.vue';
import { numberText } from '../../../shared/utils/formatNumbers.js';
import type { MovementQuery, MovementRow, MovementResource } from '../movement.js';

const props = defineProps<{
    resource: MovementResource;
    query: MovementQuery;
    rows: MovementRow[];
    total: number;
    isLoading: boolean;
}>();
const emit = defineEmits<{ query: [changes: Partial<MovementQuery>] }>();
const numericKeys = [
    'materialBase',
    'materialHeight',
    'previousStock',
    'quantity',
    'newStock',
] as const;

const headers = computed<DataTableHeader<MovementRow>[]>(() => [
    { title: 'Fecha', key: 'date', sortable: true, nowrap: true },
    { title: 'Tipo', key: 'type', sortable: true, nowrap: true },
    { title: 'Folio', key: 'referenceNumber', sortable: true, nowrap: true },
    {
        title: props.resource === 'consumables' ? 'Consumible' : 'Material',
        key: 'materialName',
        sortable: false,
        nowrap: true,
    },
    { title: 'Base', key: 'materialBase', sortable: false },
    { title: 'Altura', key: 'materialHeight', sortable: false },
    { title: 'Proveedor', key: 'supplierName', sortable: false, nowrap: true },
    { title: 'Stock anterior', key: 'previousStock', sortable: false, nowrap: true },
    { title: 'Movimiento', key: 'quantity', sortable: false },
    { title: 'Nuevo stock', key: 'newStock', sortable: false, nowrap: true },
]);
const { sortBy, changesFromOptions } = useTableQuery(
    () => props.query,
    () => ({ date: 0, type: 1, referenceNumber: 2 }),
    'desc',
);
</script>

<template>
    <ServerTable
        :headers="headers"
        :rows="rows"
        :total="total"
        :page="query.page"
        :page-size="query.length"
        :is-loading="isLoading"
        :sort-by="sortBy"
        must-sort
        @options="emit('query', changesFromOptions($event))"
    >
        <template
            v-for="key in numericKeys"
            :key="key"
            #[`item.${key}`]="{ item }"
        >
            {{ numberText(item[key]) }}
        </template>
    </ServerTable>
</template>
