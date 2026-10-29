<script setup lang="ts">
import { VDataTable } from 'vuetify/components/VDataTable';
import type { DataTableHeader } from 'vuetify';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import { currencyText, numberText } from '../../../shared/utils/formatNumbers.js';
import type { PurchaseDetail } from '../purchase.js';

defineProps<{
    rows: PurchaseDetail[];
    canChange: boolean;
    canRemove: boolean;
    isDisabled: boolean;
}>();
const emit = defineEmits<{
    remove: [id: string];
    correct: [row: PurchaseDetail];
    cancel: [row: PurchaseDetail];
}>();
const numeric = ['base', 'height', 'quantity', 'convertedQuantity'] as const;
const money = [
    'conversionUnitCost',
    'costPerUnitType',
    'netPurchaseAmount',
    'grossPurchaseAmount',
] as const;
const headers: DataTableHeader<PurchaseDetail>[] = [
    { title: 'Material', key: 'name', nowrap: true },
    {
        title: 'Medidas',
        children: [
            { title: 'Base', key: 'base' },
            { title: 'Altura', key: 'height' },
        ],
    },
    { title: 'Compra', key: 'quantity' },
    { title: 'Presentación', key: 'presentation' },
    {
        title: 'Conversión',
        children: [
            { title: 'Cantidad', key: 'convertedQuantity' },
            { title: 'Unidad', key: 'unitMeasure' },
        ],
    },
    { title: 'Costo Unitario de Conversión', key: 'conversionUnitCost' },
    { title: 'Costo por Presentación', key: 'costPerUnitType' },
    { title: 'Monto s/ IVA', key: 'netPurchaseAmount' },
    { title: 'Monto c/ IVA', key: 'grossPurchaseAmount' },
    { title: 'Estado', key: 'status' },
    { title: 'Acciones', key: 'actions', sortable: false },
];
</script>

<template>
    <TableFrame>
        <VDataTable
            :headers="headers"
            :items="rows"
            item-value="id"
            :items-per-page="10"
            :items-per-page-options="[10, 20, 50]"
            :mobile="false"
            density="compact"
            no-data-text="Agrega un detalle a la compra."
            items-per-page-text="Detalles por página:"
            page-text="{0}–{1} de {2}"
        >
            <template
                v-for="key in numeric"
                :key="key"
                #[`item.${key}`]="{ item }"
            >
                {{ numberText(item[key]) }}
            </template>
            <template
                v-for="key in money"
                :key="key"
                #[`item.${key}`]="{ item }"
            >
                {{ currencyText(item[key]) }}
            </template>
            <template #[`item.status`]="{ item }">
                {{ item.isNew ? 'Nuevo' : item.status === 'ACTIVE' ? 'Activo' : 'Cancelado' }}
            </template>
            <template #[`item.actions`]="{ item }">
                <TableAction
                    v-if="item.isNew && canRemove"
                    label="Quitar detalle nuevo"
                    icon="$delete"
                    :is-disabled="isDisabled"
                    @click="emit('remove', item.id)"
                />
                <template v-if="canChange && !item.isNew && item.status === 'ACTIVE'">
                    <TableAction
                        label="Corregir detalle"
                        icon="$edit"
                        :is-disabled="isDisabled"
                        @click="emit('correct', item)"
                    />
                    <TableAction
                        label="Cancelar detalle"
                        icon="$delete"
                        color="error"
                        :is-disabled="isDisabled"
                        @click="emit('cancel', item)"
                    />
                </template>
            </template>
        </VDataTable>
    </TableFrame>
</template>
