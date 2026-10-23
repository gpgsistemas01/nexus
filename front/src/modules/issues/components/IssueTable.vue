<script setup lang="ts">
import { mdiEyeOutline, mdiPackageUp, mdiUndoVariant } from '@mdi/js';
import type { DataTableHeader } from 'vuetify';
import ServerTable from '../../../shared/components/ServerTable.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import { useTableQuery } from '../../../shared/composables/useTableQuery.js';
import { canEditIssue, canSupplyIssue, canReturnIssue } from '../issueRules.js';
import type { IssueRow, IssueQuery, IssueOpenMode } from '../issue.js';

const props = defineProps<{
    rows: IssueRow[];
    query: IssueQuery;
    total: number;
    isLoading: boolean;
    isReading: boolean;
    canManage: boolean;
    canSupply: boolean;
    isWaste: boolean;
}>();
const emit = defineEmits<{
    query: [changes: Partial<IssueQuery>];
    open: [row: IssueRow, mode: IssueOpenMode];
}>();
const headers: DataTableHeader<IssueRow>[] = [
    { title: 'Folio', key: 'referenceNumber', nowrap: true },
    { title: 'Solicitud', key: 'requestDate', nowrap: true },
    { title: 'Área', key: 'departmentName' },
    { title: 'Proyecto', key: 'projectNumber' },
    { title: 'Cliente', key: 'clientName' },
    { title: 'Estado surtido', key: 'fulfillmentStatus', sortable: false },
    ...(props.isWaste ? [{ title: 'Observaciones', key: 'observations' }] : []),
    { title: 'Acciones', key: 'actions', sortable: false },
];
const columns = {
    referenceNumber: 0,
    requestDate: 1,
    departmentName: 2,
    projectNumber: 3,
    clientName: 4,
    ...(props.isWaste ? { observations: 6 } : {}),
};
const { sortBy, changesFromOptions } = useTableQuery(
    () => props.query,
    () => columns,
    'desc',
);

const dateText = (value: string) =>
    new Date(value).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        dateStyle: 'short',
        timeStyle: 'short',
    });
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
        <template #[`item.requestDate`]="{ item }">
            {{ item.requesterName }}
            <br />
            <small>{{ dateText(item.requestDate) }}</small>
        </template>
        <template #[`item.actions`]="{ item }">
            <TableAction
                label="Consultar salida"
                :icon="`svg:${mdiEyeOutline}`"
                :is-disabled="isReading"
                @click="emit('open', item, 'view')"
            />
            <TableAction
                v-if="canManage && canEditIssue(item)"
                label="Editar salida"
                icon="$edit"
                :is-disabled="isReading"
                @click="emit('open', item, 'edit')"
            />
            <TableAction
                v-if="canSupply && canSupplyIssue(item)"
                label="Surtir detalle"
                :icon="`svg:${mdiPackageUp}`"
                :is-disabled="isReading"
                @click="emit('open', item, 'supply')"
            />
            <TableAction
                v-if="canSupply && canReturnIssue(item)"
                label="Devolver material surtido"
                :icon="`svg:${mdiUndoVariant}`"
                :is-disabled="isReading"
                @click="emit('open', item, 'return')"
            />
        </template>
    </ServerTable>
</template>
