<script setup lang="ts">
import { computed, ref } from 'vue';
import { VDataTable } from 'vuetify/components/VDataTable';
import { mdiUndoVariant } from '@mdi/js';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import ResponsiveTableCards from '../../../shared/components/ResponsiveTableCards.vue';
import IssueSupplyField from './IssueSupplyField.vue';
import {
    numberText,
    currencyText,
    convertedQuantityText,
} from '../../../shared/utils/formatNumbers.js';
import { getIssueReturnableQuantity, getIssuePendingQuantity } from '../issueRules.js';
import type { IssueDetail, IssueMode, IssueSupplyChanges } from '../issue.js';

const props = defineProps<{
    rows: IssueDetail[];
    mode: IssueMode;
    itemLabel: string;
    isDisabled: boolean;
}>();
const emit = defineEmits<{
    remove: [id: string];
    supply: [id: string, changes: IssueSupplyChanges];
    return: [row: IssueDetail];
}>();
const headers = computed<DataTableHeader<IssueDetail>[]>(() => [
    { title: props.itemLabel, key: 'name', nowrap: true, fixed: 'start' },
    ...(props.mode === 'view' ? [{ title: 'Estado del detalle', key: 'fulfillmentStatus' }] : []),
    {
        title: 'Medidas',
        children: [
            { title: 'Base', key: 'base' },
            { title: 'Altura', key: 'height' },
        ],
    },
    { title: 'Salida', key: 'quantity' },
    ...(['supply', 'return', 'view'].includes(props.mode)
        ? [{ title: 'Cantidad surtida', key: 'suppliedQuantity' }]
        : []),
    ...(['return', 'view'].includes(props.mode)
        ? [{ title: 'Cantidad devuelta', key: 'returnedQuantity' }]
        : []),
    ...(props.mode === 'view'
        ? [
              { title: 'Pendiente de surtir', key: 'pendingQuantity' },
              { title: 'Saldo entregado', key: 'deliveredQuantity' },
          ]
        : []),
    { title: 'Presentación', key: 'presentation' },
    {
        title: 'Conversión',
        children: [
            { title: 'Cantidad', key: 'convertedQuantity' },
            { title: 'Unidad', key: 'unitMeasure' },
        ],
    },
    ...(props.mode === 'supply'
        ? [
              { title: 'Costo unitario de Conversión', key: 'maxUnitCost' },
              { title: 'Cantidad a surtir', key: 'quantityToSupply', minWidth: 160 },
              { title: 'Cantidad de proyecto', key: 'projectConvertedQuantity' },
              { title: 'Diferencia', key: 'difference' },
              { title: 'Surtir', key: 'supply', sortable: false },
          ]
        : []),
    ...(['create', 'edit', 'return'].includes(props.mode)
        ? [{ title: 'Acciones', key: 'actions', sortable: false }]
        : []),
]);
const numeric = ['base', 'height', 'quantity', 'suppliedQuantity', 'returnedQuantity'] as const;
const sortBy = ref<DataTableSortItem[]>([]);

const projectValue = (item: IssueDetail) =>
    item.isOriginallySupplied && item.projectConvertedQuantity !== ''
        ? convertedQuantityText(item.projectConvertedQuantity, item.unitMeasure, {
              useGrouping: false,
          })
        : item.projectConvertedQuantity;

const cardValue = (item: IssueDetail, key: string) => {
    if (['base', 'height', 'quantity', 'suppliedQuantity', 'returnedQuantity'].includes(key))
        return numberText(item[key as keyof IssueDetail] as number | null);

    if (key === 'convertedQuantity')
        return convertedQuantityText(item.convertedQuantity, item.unitMeasure);

    if (key === 'maxUnitCost')
        return item.maxUnitCost == null ? '—' : currencyText(item.maxUnitCost);

    if (key === 'pendingQuantity') return numberText(getIssuePendingQuantity(item));

    if (key === 'deliveredQuantity') return numberText(getIssueReturnableQuantity(item));

    if (key === 'difference')
        return item.projectConvertedQuantity
            ? convertedQuantityText(
                  item.convertedQuantity - Number(item.projectConvertedQuantity),
                  item.unitMeasure,
              )
            : '—';

    if (key === 'projectConvertedQuantity') return projectValue(item);

    if (key === 'isSupplied') return item.isSupplied ? 'Sí' : 'No';

    const value = item[key as keyof IssueDetail];
    return value == null || value === '' ? '—' : String(value);
};

const sortValue = (item: IssueDetail, key: string): unknown => {
    if (key === 'pendingQuantity') return getIssuePendingQuantity(item);

    if (key === 'deliveredQuantity') return getIssueReturnableQuantity(item);

    if (key === 'difference')
        return item.projectConvertedQuantity
            ? item.convertedQuantity - Number(item.projectConvertedQuantity)
            : null;

    return item[key as keyof IssueDetail];
};
</script>

<template>
    <TableFrame>
        <VDataTable
            v-model:sort-by="sortBy"
            :headers="headers"
            :items="rows"
            item-value="id"
            :items-per-page="10"
            :items-per-page-options="[10, 20, 50]"
            :mobile="false"
            density="compact"
            no-data-text="Agrega un detalle a la salida."
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
            <template #[`item.fulfillmentStatus`]="{ item }">
                {{ item.fulfillmentStatus || '—' }}
            </template>
            <template #[`item.pendingQuantity`]="{ item }">
                {{ numberText(getIssuePendingQuantity(item)) }}
            </template>
            <template #[`item.deliveredQuantity`]="{ item }">
                {{ numberText(getIssueReturnableQuantity(item)) }}
            </template>
            <template #[`item.maxUnitCost`]="{ item }">
                {{ item.maxUnitCost == null ? '—' : currencyText(item.maxUnitCost) }}
            </template>
            <template #[`item.quantityToSupply`]="{ item }">
                <IssueSupplyField
                    field="quantityToSupply"
                    :item="item"
                    :is-disabled="isDisabled"
                    @supply="emit('supply', item.id, $event)"
                />
            </template>
            <template #[`item.projectConvertedQuantity`]="{ item }">
                <IssueSupplyField
                    field="projectConvertedQuantity"
                    :item="item"
                    :is-disabled="isDisabled"
                    @supply="emit('supply', item.id, $event)"
                />
            </template>
            <template #[`item.difference`]="{ item }">
                {{
                    item.projectConvertedQuantity
                        ? convertedQuantityText(
                              item.convertedQuantity - Number(item.projectConvertedQuantity),
                              item.unitMeasure,
                          )
                        : '—'
                }}
            </template>
            <template #[`item.supply`]="{ item }">
                <IssueSupplyField
                    field="supply"
                    :item="item"
                    :is-disabled="isDisabled"
                    @supply="emit('supply', item.id, $event)"
                />
            </template>
            <template #[`item.actions`]="{ item }">
                <TableAction
                    v-if="
                        mode === 'return' &&
                        !item.isCanceled &&
                        getIssueReturnableQuantity(item) > 0
                    "
                    label="Devolver detalle de salida"
                    :icon="`svg:${mdiUndoVariant}`"
                    color="accent"
                    :is-disabled="isDisabled"
                    @click="emit('return', item)"
                />
                <TableAction
                    v-else-if="(mode === 'create' || mode === 'edit') && !item.isCanceled"
                    label="Eliminar detalle"
                    icon="$delete"
                    color="error"
                    :is-disabled="isDisabled || item.isOriginallySupplied"
                    @click="emit('remove', item.id)"
                />
            </template>
        </VDataTable>
        <ResponsiveTableCards
            :headers="headers"
            :rows="rows"
            :format-value="cardValue"
            :sort-by="sortBy"
            sort-rows
            :sort-value="sortValue"
            @sort-by="sortBy = $event"
        >
            <template #[`item.name`]="{ item }">{{ item.name }}</template>
            <template #[`item.fulfillmentStatus`]="{ item }">
                {{ item.fulfillmentStatus || '—' }}
            </template>
            <template #[`item.quantityToSupply`]="{ item }">
                <IssueSupplyField
                    field="quantityToSupply"
                    :item="item"
                    :is-disabled="isDisabled"
                    @supply="emit('supply', item.id, $event)"
                />
            </template>
            <template #[`item.projectConvertedQuantity`]="{ item }">
                <IssueSupplyField
                    field="projectConvertedQuantity"
                    :item="item"
                    :is-disabled="isDisabled"
                    @supply="emit('supply', item.id, $event)"
                />
            </template>
            <template #[`item.supply`]="{ item }">
                <IssueSupplyField
                    field="supply"
                    :item="item"
                    :is-disabled="isDisabled"
                    @supply="emit('supply', item.id, $event)"
                />
            </template>
            <template #[`item.actions`]="{ item }">
                <TableAction
                    v-if="
                        mode === 'return' &&
                        !item.isCanceled &&
                        getIssueReturnableQuantity(item) > 0
                    "
                    label="Devolver detalle de salida"
                    :icon="`svg:${mdiUndoVariant}`"
                    color="accent"
                    :is-disabled="isDisabled"
                    @click="emit('return', item)"
                />
                <TableAction
                    v-else-if="(mode === 'create' || mode === 'edit') && !item.isCanceled"
                    label="Eliminar detalle"
                    icon="$delete"
                    color="error"
                    :is-disabled="isDisabled || item.isOriginallySupplied"
                    @click="emit('remove', item.id)"
                />
            </template>
        </ResponsiveTableCards>
    </TableFrame>
</template>
