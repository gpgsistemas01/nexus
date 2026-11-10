<script setup lang="ts">
import { GOODS_RECEIPT_DETAIL_STATUSES } from '@nexus/purchase-statuses';
import { computed, ref } from 'vue';
import { VDataTable } from 'vuetify/components/VDataTable';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import ResponsiveTableCards from '../../../shared/components/ResponsiveTableCards.vue';
import {
    currencyText,
    numberText,
    convertedQuantityText,
} from '../../../shared/utils/formatNumbers.js';
import type { PurchaseDetail } from '../purchase.js';

const props = defineProps<{
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
const numeric = ['base', 'height', 'quantity'] as const;
const money = [
    'conversionUnitCost',
    'costPerUnitType',
    'netPurchaseAmount',
    'grossPurchaseAmount',
] as const;
const headers = computed<DataTableHeader<PurchaseDetail>[]>(() => [
    { title: 'Material', key: 'name', nowrap: true, fixed: 'start' },
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
    ...(props.canChange || props.canRemove
        ? [{ title: 'Acciones', key: 'actions', sortable: false }]
        : []),
]);
const sortBy = ref<DataTableSortItem[]>([]);

const cardValue = (item: PurchaseDetail, key: string) => {
    if (['base', 'height', 'quantity'].includes(key))
        return numberText(item[key as 'base' | 'height' | 'quantity']);

    if (key === 'convertedQuantity')
        return convertedQuantityText(item.convertedQuantity, item.unitMeasure);

    if (
        [
            'conversionUnitCost',
            'costPerUnitType',
            'netPurchaseAmount',
            'grossPurchaseAmount',
        ].includes(key)
    )
        return currencyText(
            item[
                key as
                    | 'conversionUnitCost'
                    | 'costPerUnitType'
                    | 'netPurchaseAmount'
                    | 'grossPurchaseAmount'
            ],
        );

    if (key === 'name')
        return item.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED
            ? `${item.name} Cancelado`
            : item.name;

    const value = item[key as keyof PurchaseDetail];
    return value == null || value === '' ? '—' : String(value);
};
</script>

<template>
    <TableFrame
        fit-columns
        mobile-cards
    >
        <VDataTable
            v-model:sort-by="sortBy"
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
            <template #[`item.convertedQuantity`]="{ item }">
                {{ convertedQuantityText(item.convertedQuantity, item.unitMeasure) }}
            </template>
            <template
                v-for="key in money"
                :key="key"
                #[`item.${key}`]="{ item }"
            >
                {{ currencyText(item[key]) }}
            </template>
            <template #[`item.name`]="{ item }">
                {{ item.name }}
                <small
                    v-if="item.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED"
                    class="d-block text-error"
                >
                    Cancelado
                </small>
            </template>
            <template #[`item.actions`]="{ item }">
                <TableAction
                    v-if="
                        item.status === GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE &&
                        item.isNew &&
                        canRemove
                    "
                    label="Quitar detalle nuevo"
                    icon="$delete"
                    color="error"
                    :is-disabled="isDisabled"
                    @click="emit('remove', item.id)"
                />
                <template
                    v-if="
                        canChange &&
                        !item.isNew &&
                        item.status === GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE
                    "
                >
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
        <ResponsiveTableCards
            :headers="headers"
            :rows="rows"
            :format-value="cardValue"
            :sort-by="sortBy"
            sort-rows
            @sort-by="sortBy = $event"
        >
            <template #[`item.name`]="{ item }">
                {{ cardValue(item, 'name') }}
            </template>
            <template #[`item.actions`]="{ item }">
                <TableAction
                    v-if="
                        item.status === GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE &&
                        item.isNew &&
                        canRemove
                    "
                    label="Quitar detalle nuevo"
                    icon="$delete"
                    color="error"
                    :is-disabled="isDisabled"
                    @click="emit('remove', item.id)"
                />
                <template
                    v-if="
                        canChange &&
                        !item.isNew &&
                        item.status === GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE
                    "
                >
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
        </ResponsiveTableCards>
    </TableFrame>
</template>
