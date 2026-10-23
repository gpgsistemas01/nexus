<script setup lang="ts">
import { computed } from 'vue';
import { mdiEyeOutline } from '@mdi/js';
import type { DataTableHeader } from 'vuetify';
import ServerTable from '../../../shared/components/ServerTable.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import { useTableQuery } from '../../../shared/composables/useTableQuery.js';
import { canEditPurchase } from '../purchaseRules.js';
import type { PurchaseRow, PurchaseQuery } from '../purchase.js';

const props = defineProps<{
    rows: PurchaseRow[];
    query: PurchaseQuery;
    total: number;
    isLoading: boolean;
    isReading: boolean;
}>();
const emit = defineEmits<{
    query: [changes: Partial<PurchaseQuery>];
    open: [row: PurchaseRow, action: 'view' | 'edit'];
}>();
const headers: DataTableHeader<PurchaseRow>[] = [
    { title: 'Folio', key: 'referenceNumber', nowrap: true },
    { title: 'Recepción', key: 'receptionDate', nowrap: true },
    { title: 'Proveedor', key: 'supplierName', nowrap: true },
    { title: 'N° Factura', key: 'invoice', nowrap: true },
    { title: 'Estado', key: 'status', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false },
];
const columns = computed(() => ({
    referenceNumber: 0,
    receptionDate: 1,
    supplierName: 2,
    invoice: 3,
}));
const { sortBy, changesFromOptions } = useTableQuery(
    () => props.query,
    () => columns.value,
    'desc',
);

const displayDate = (value: string) =>
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
        <template #[`item.receptionDate`]="{ item }">
            <span>{{ item.receivedByName }}</span>
            <br />
            <small>{{ displayDate(item.receptionDate) }}</small>
        </template>
        <template #[`item.invoice`]="{ item }">
            {{ item.isInvoiced ? item.invoice : 'Sin factura' }}
        </template>
        <template #[`item.actions`]="{ item }">
            <TableAction
                label="Ver compra"
                :icon="`svg:${mdiEyeOutline}`"
                :is-disabled="isReading"
                @click="emit('open', item, 'view')"
            />
            <TableAction
                v-if="canEditPurchase(item)"
                label="Editar compra"
                icon="$edit"
                :is-disabled="isReading"
                @click="emit('open', item, 'edit')"
            />
        </template>
    </ServerTable>
</template>
