<script setup lang="ts">
import { computed } from 'vue';
import type { DataTableHeader } from 'vuetify';
import TableAction from '../../../shared/components/TableAction.vue';
import StateBadge from '../../../shared/components/StateBadge.vue';
import { useTableQuery } from '../../../shared/composables/useTableQuery.js';
import ServerTable from '../../../shared/components/ServerTable.vue';
import type { RecordQuery } from '../../../shared/list.js';
import type { DirectoryEntry, DirectoryResource } from '../directory.js';

const props = defineProps<{
    resource: DirectoryResource;
    rows: DirectoryEntry[];
    query: RecordQuery;
    total: number;
    isLoading: boolean;
    canEdit: boolean;
    canSeeState: boolean;
}>();
const emit = defineEmits<{ edit: [row: DirectoryEntry]; query: [changes: Partial<RecordQuery>] }>();
const headers = computed<DataTableHeader<DirectoryEntry>[]>(() => [
    {
        title: props.resource === 'clients' ? 'Nombre' : 'Nombre comercial',
        key: 'name',
        sortable: true,
    },
    ...(props.resource === 'suppliers'
        ? [{ title: 'Razón social', key: 'legalName', sortable: true }]
        : []),
    ...(props.canSeeState ? [{ title: 'Activo', key: 'isActive', sortable: false }] : []),
    ...(props.canEdit ? [{ title: 'Acciones', key: 'actions', sortable: false }] : []),
]);
const { sortBy, changesFromOptions } = useTableQuery(
    () => props.query,
    (): Readonly<Record<string, number>> =>
        props.resource === 'suppliers' ? { name: 0, legalName: 1 } : { name: 0 },
);
</script>

<template>
    <ServerTable
        :headers="headers"
        :rows="rows"
        :total="total"
        :page="query.page"
        :page-size="query.length"
        :sort-by="sortBy"
        must-sort
        :is-loading="isLoading"
        @options="emit('query', changesFromOptions($event))"
    >
        <template #[`item.isActive`]="{ item }"><StateBadge :is-active="item.isActive" /></template>
        <template #[`item.actions`]="{ item }">
            <TableAction
                v-if="canEdit"
                icon="$edit"
                label="Editar registro"
                @click="emit('edit', item)"
            />
        </template>
    </ServerTable>
</template>
