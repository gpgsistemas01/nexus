<script setup lang="ts">
import { computed } from 'vue';
import type { DataTableHeader } from 'vuetify';
import { useTableQuery } from '../../../shared/composables/useTableQuery.js';
import ServerTable from '../../../shared/components/ServerTable.vue';
import { numberText } from '../../../shared/utils/formatNumbers.js';
import { MOVEMENT_CONFIG } from '../movement.js';
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

const measures: DataTableHeader<MovementRow>[] = [
    { title: 'Base', key: 'materialBase', sortable: false },
    { title: 'Altura', key: 'materialHeight', sortable: false },
];
const stockChange: DataTableHeader<MovementRow>[] = [
    { title: 'Stock anterior', key: 'previousStock', sortable: false, nowrap: true },
    { title: 'Movimiento', key: 'quantity', sortable: false },
    { title: 'Nuevo stock', key: 'newStock', sortable: false, nowrap: true },
];

const movementColumns = (title: string, columns: DataTableHeader<MovementRow>[]) =>
    props.resource === 'wastes'
        ? [
              {
                  title,
                  align: 'center' as const,
                  children: columns.map((column) => ({ ...column, align: 'end' as const })),
              },
          ]
        : columns;

const headers = computed<DataTableHeader<MovementRow>[]>(() => [
    { title: 'Fecha', key: 'date', sortable: true, nowrap: true },
    { title: 'Tipo', key: 'type', sortable: true, nowrap: true },
    { title: 'Folio', key: 'referenceNumber', sortable: true, nowrap: true },
    {
        title: MOVEMENT_CONFIG[props.resource].itemLabel,
        key: 'materialName',
        sortable: false,
        nowrap: true,
    },
    { title: 'Proveedor', key: 'supplierName', sortable: false, nowrap: true },
    ...movementColumns('Medidas', measures),
    ...movementColumns('Cambio de existencia', stockChange),
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
