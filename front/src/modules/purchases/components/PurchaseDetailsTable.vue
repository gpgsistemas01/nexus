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
    { title: 'Artículo', key: 'name', nowrap: true },
    { title: 'Base', key: 'base' },
    { title: 'Altura', key: 'height' },
    { title: 'Cantidad', key: 'quantity' },
    { title: 'Presentación', key: 'presentation' },
    { title: 'Cantidad convertida', key: 'convertedQuantity' },
    { title: 'Unidad', key: 'unitMeasure' },
    { title: 'Costo por conversión', key: 'conversionUnitCost' },
    { title: 'Costo por presentación', key: 'costPerUnitType' },
    { title: 'Importe neto', key: 'netPurchaseAmount' },
    { title: 'Importe con IVA', key: 'grossPurchaseAmount' },
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
            no-data-text="Agrega una partida a la compra."
            items-per-page-text="Partidas por página:"
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
                {{ item.isNew ? 'Nueva' : item.status === 'ACTIVE' ? 'Activa' : 'Cancelada' }}
            </template>
            <template #[`item.actions`]="{ item }">
                <TableAction
                    v-if="item.isNew && canRemove"
                    label="Quitar partida nueva"
                    icon="$delete"
                    :is-disabled="isDisabled"
                    @click="emit('remove', item.id)"
                />
                <template v-if="canChange && !item.isNew && item.status === 'ACTIVE'">
                    <TableAction
                        label="Corregir partida"
                        icon="$edit"
                        :is-disabled="isDisabled"
                        @click="emit('correct', item)"
                    />
                    <TableAction
                        label="Cancelar partida"
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
