<script setup lang="ts">
import { computed } from 'vue';
import { VDataTable } from 'vuetify/components/VDataTable';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import { VTextField } from 'vuetify/components/VTextField';
import { mdiUndoVariant } from '@mdi/js';
import type { DataTableHeader } from 'vuetify';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import { numberText, currencyText } from '../../../shared/utils/formatNumbers.js';
import { getIssueReturnableQuantity } from '../issueRules.js';
import type { IssueDetail, IssueMode } from '../issue.js';

const props = defineProps<{
    rows: IssueDetail[];
    mode: IssueMode;
    itemLabel: string;
    isDisabled: boolean;
}>();
const emit = defineEmits<{
    remove: [id: string];
    supply: [
        id: string,
        changes: Partial<Pick<IssueDetail, 'isSupplied' | 'projectConvertedQuantity'>>,
    ];
    return: [row: IssueDetail];
}>();
const headers = computed<DataTableHeader<IssueDetail>[]>(() => [
    { title: props.itemLabel, key: 'name', nowrap: true },
    {
        title: 'Medidas',
        children: [
            { title: 'Base', key: 'base' },
            { title: 'Altura', key: 'height' },
        ],
    },
    { title: 'Salida', key: 'quantity' },
    { title: 'Cantidad surtida', key: 'suppliedQuantity' },
    { title: 'Cantidad devuelta', key: 'returnedQuantity' },
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
              { title: 'Cantidad de proyecto', key: 'projectConvertedQuantity' },
              { title: 'Diferencia', key: 'difference' },
              { title: 'Surtir', key: 'supply' },
          ]
        : []),
    ...(['create', 'edit', 'return'].includes(props.mode)
        ? [{ title: 'Acciones', key: 'actions', sortable: false }]
        : []),
]);
const numeric = [
    'base',
    'height',
    'quantity',
    'suppliedQuantity',
    'returnedQuantity',
    'convertedQuantity',
] as const;
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
            <template #[`item.maxUnitCost`]="{ item }">
                {{ item.maxUnitCost == null ? '—' : currencyText(item.maxUnitCost) }}
            </template>
            <template #[`item.projectConvertedQuantity`]="{ item }">
                <VTextField
                    :aria-label="`Cantidad de proyecto: ${item.name}`"
                    type="number"
                    min="0.01"
                    step="0.01"
                    :model-value="item.projectConvertedQuantity"
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
                        ? numberText(item.convertedQuantity - Number(item.projectConvertedQuantity))
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
                    v-else-if="mode === 'create' || mode === 'edit'"
                    label="Eliminar detalle"
                    icon="$delete"
                    :is-disabled="isDisabled || item.isOriginallySupplied || item.isCanceled"
                    @click="emit('remove', item.id)"
                />
            </template>
        </VDataTable>
    </TableFrame>
</template>
