<script setup lang="ts">
import { computed } from 'vue';
import { VDataTable } from 'vuetify/components/VDataTable';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTextField } from 'vuetify/components/VTextField';
import { mdiUndoVariant } from '@mdi/js';
import { isPiecePresentation } from '@nexus/piece-quantity';
import type { DataTableHeader } from 'vuetify';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
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
              { title: 'Surtir', key: 'supply' },
          ]
        : []),
    ...(['create', 'edit', 'return'].includes(props.mode)
        ? [{ title: 'Acciones', key: 'actions', sortable: false }]
        : []),
]);
const numeric = ['base', 'height', 'quantity', 'suppliedQuantity', 'returnedQuantity'] as const;

const projectValue = (item: IssueDetail) =>
    item.isOriginallySupplied && item.projectConvertedQuantity !== ''
        ? convertedQuantityText(item.projectConvertedQuantity, item.unitMeasure, {
              useGrouping: false,
          })
        : item.projectConvertedQuantity;
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
                <VTextField
                    v-if="getIssuePendingQuantity(item) > 0"
                    :aria-label="`Cantidad a surtir: ${item.name}`"
                    type="number"
                    :min="isPiecePresentation(item.presentation) ? 1 : 0.01"
                    :step="isPiecePresentation(item.presentation) ? 1 : 0.01"
                    :max="getIssuePendingQuantity(item)"
                    :model-value="item.quantityToSupply"
                    :hint="`Pendiente: ${numberText(getIssuePendingQuantity(item))} ${item.presentation}`"
                    persistent-hint
                    :disabled="
                        isDisabled ||
                        item.isOriginallySupplied ||
                        item.isCanceled ||
                        !item.isSupplied
                    "
                    @update:model-value="
                        emit('supply', item.id, { quantityToSupply: $event ?? '' })
                    "
                />
                <span v-else>Completamente surtido</span>
            </template>
            <template #[`item.projectConvertedQuantity`]="{ item }">
                <VTextField
                    :aria-label="`Cantidad de proyecto: ${item.name}`"
                    type="number"
                    min="0.01"
                    step="0.01"
                    :model-value="projectValue(item)"
                    :disabled="
                        isDisabled ||
                        item.isOriginallySupplied ||
                        item.isCanceled ||
                        !item.isSupplied
                    "
                    hide-details
                    @update:model-value="
                        emit('supply', item.id, { projectConvertedQuantity: $event ?? '' })
                    "
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
                <VCheckbox
                    :aria-label="`Surtir: ${item.name}`"
                    :model-value="item.isSupplied"
                    :disabled="isDisabled || item.isOriginallySupplied || item.isCanceled"
                    hide-details
                    @update:model-value="emit('supply', item.id, { isSupplied: $event === true })"
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
                    :is-disabled="isDisabled"
                    @click="emit('return', item)"
                />
                <TableAction
                    v-else-if="(mode === 'create' || mode === 'edit') && !item.isCanceled"
                    label="Eliminar detalle"
                    icon="$delete"
                    :is-disabled="isDisabled || item.isOriginallySupplied"
                    @click="emit('remove', item.id)"
                />
            </template>
        </VDataTable>
    </TableFrame>
</template>
