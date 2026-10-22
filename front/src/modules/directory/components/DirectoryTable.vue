<script setup lang="ts">
import { computed } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
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
    { title: 'Acciones', key: 'actions', sortable: false },
]);
const sortBy = computed(() => [
    {
        key: props.query.orderColumn === 1 && props.resource === 'suppliers' ? 'legalName' : 'name',
        order: props.query.direction,
    },
]);

const onOptions = (options: { page: number; itemsPerPage: number; sortBy: DataTableSortItem[] }) =>
    emit('query', {
        page: options.page,
        length: options.itemsPerPage,
        orderColumn: options.sortBy[0]?.key === 'legalName' ? 1 : 0,
        direction: options.sortBy[0]?.order === 'desc' ? 'desc' : 'asc',
    });
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
        @options="onOptions"
    >
        <template #[`item.isActive`]="{ item }">{{ item.isActive ? 'Sí' : 'No' }}</template>
        <template #[`item.actions`]="{ item }">
            <VBtn
                v-if="canEdit"
                icon="$edit"
                aria-label="Editar registro"
                size="small"
                color="primary"
                variant="text"
                @click="emit('edit', item)"
            />
        </template>
    </ServerTable>
</template>
