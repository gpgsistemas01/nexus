<script setup lang="ts">
import { computed, ref } from 'vue';
import { VDataTable } from 'vuetify/components/VDataTable';
import { mdiUndoVariant } from '@mdi/js';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import ResponsiveTableCards from '../../../shared/components/ResponsiveTableCards.vue';
import RecordTotals from '../../../shared/components/RecordTotals.vue';
import { MAX_UNIT_COST_LABEL } from '../../../shared/ui/inventoryLabels.js';
import IssueSupplyField from './IssueSupplyField.vue';
import {
    numberText,
    currencyText,
    convertedQuantityText,
} from '../../../shared/utils/formatNumbers.js';
import { getIssueReturnableQuantity, getIssuePendingQuantity } from '../issueRules.js';
import { getIssueDetailAmounts, getIssueTotals } from '../issueDetails.js';
import { ISSUE_CONFIG } from '../issueConfig.js';
import type { IssueDetail, IssueMode, IssueResource, IssueSupplyChanges } from '../issue.js';

const props = defineProps<{
    rows: IssueDetail[];
    mode: IssueMode;
    resource: IssueResource;
    isDisabled: boolean;
    canReadCosts: boolean;
}>();
const emit = defineEmits<{
    remove: [id: string];
    supply: [id: string, changes: IssueSupplyChanges];
    return: [row: IssueDetail];
}>();

const groupWasteColumns = (title: string, columns: DataTableHeader<IssueDetail>[]) =>
    props.resource === 'wastes' && columns.length > 1
        ? [{ title, align: 'center' as const, children: columns }]
        : columns;

const amountColumns = [
    {
        title: 'Monto solicitado',
        key: 'requested',
        align: 'end',
        value: (item) => getIssueDetailAmounts(item).requested,
    },
    {
        title: 'Monto entregado neto',
        key: 'delivered',
        align: 'end',
        value: (item) => getIssueDetailAmounts(item).delivered,
    },
] satisfies DataTableHeader<IssueDetail>[];

const totals = computed(() => {
    if (!props.canReadCosts) return [];

    const { requested, delivered } = getIssueTotals(props.rows);
    return [
        { label: 'Total solicitado', value: currencyText(requested) },
        { label: 'Total entregado neto', value: currencyText(delivered) },
    ];
});

const headers = computed<DataTableHeader<IssueDetail>[]>(() => {
    const { mode, resource, canReadCosts } = props;

    return [
        {
            title: ISSUE_CONFIG[resource].item,
            key: 'name',
            align: 'start',
            nowrap: true,
            fixed: 'start',
        },
        {
            title: 'Medidas',
            children: [
                { title: 'Base', key: 'base', align: 'end' },
                { title: 'Altura', key: 'height', align: 'end' },
            ],
        },
        { title: 'Presentación', key: 'presentation', align: 'start' },
        { title: 'Salida', key: 'quantity', align: 'end' },
        {
            title: 'Conversión',
            children: [
                { title: 'Cantidad', key: 'convertedQuantity', align: 'end' },
                { title: 'Unidad', key: 'unitMeasure', align: 'start' },
            ],
        },
        ...(canReadCosts
            ? [
                  { title: MAX_UNIT_COST_LABEL, key: 'maxUnitCost', align: 'end' as const },
                  { title: 'Importes', children: [...amountColumns] },
              ]
            : []),
        ...groupWasteColumns('Surtido registrado', [
            ...(['supply', 'return', 'view'].includes(mode)
                ? [{ title: 'Cantidad surtida', key: 'suppliedQuantity', align: 'end' as const }]
                : []),
            ...(['supply', 'view'].includes(mode)
                ? [{ title: 'Pendiente de surtir', key: 'pendingQuantity', align: 'end' as const }]
                : []),
        ]),
        ...(['return', 'view'].includes(mode)
            ? groupWasteColumns('Devolución', [
                  { title: 'Cantidad devuelta', key: 'returnedQuantity', align: 'end' },
                  { title: 'Saldo entregado', key: 'deliveredQuantity', align: 'end' },
              ])
            : []),
        ...(mode === 'view'
            ? [{ title: 'Estado del detalle', key: 'fulfillmentStatus', align: 'start' as const }]
            : []),
        ...(mode === 'supply'
            ? [
                  ...groupWasteColumns('Captura de surtido', [
                      {
                          title: 'Cantidad a surtir',
                          key: 'quantityToSupply',
                          align: 'end',
                          minWidth: 160,
                      },
                      {
                          title: 'Cantidad de proyecto',
                          key: 'projectConvertedQuantity',
                          align: 'end',
                      },
                      { title: 'Diferencia', key: 'difference', align: 'end' },
                  ]),
                  {
                      title: 'Surtir',
                      key: 'supply',
                      align: 'center' as const,
                      fixed: 'end' as const,
                      sortable: false,
                  },
              ]
            : []),
        ...(['create', 'edit', 'return'].includes(mode)
            ? [
                  {
                      title: 'Acciones',
                      key: 'actions',
                      align: 'center' as const,
                      fixed: 'end' as const,
                      sortable: false,
                  },
              ]
            : []),
    ];
});
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

    if (key === 'name') return [item.name, item.supplierName ?? ''].filter(Boolean).join('\n');

    if (key === 'convertedQuantity')
        return convertedQuantityText(item.convertedQuantity, item.unitMeasure);

    if (key === 'maxUnitCost') return currencyText(item.maxUnitCost);

    if (key === 'requested' || key === 'delivered')
        return currencyText(getIssueDetailAmounts(item)[key]);

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
    if (key === 'requested' || key === 'delivered') return getIssueDetailAmounts(item)[key];

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
    <TableFrame
        fit-columns
        mobile-cards
        details
        :class="{ 'table-frame--entry': !!$slots.entry }"
    >
        <VDataTable
            v-model:sort-by="sortBy"
            :headers="headers"
            :items="rows"
            :hide-no-data="!!$slots.entry"
            item-value="id"
            :items-per-page="10"
            :items-per-page-options="[10, 20, 50]"
            :mobile="false"
            density="compact"
            no-data-text="Agrega un detalle a la salida."
            items-per-page-text="Detalles por página:"
            page-text="{0}–{1} de {2}"
        >
            <template #[`body.append`]="{ columns }">
                <slot
                    name="entry"
                    :columns="columns.map((column) => String(column.key))"
                />
            </template>
            <template
                v-for="key in numeric"
                :key="key"
                #[`item.${key}`]="{ item }"
            >
                {{ numberText(item[key]) }}
            </template>
            <template #[`item.name`]="{ item }">
                <span>{{ item.name }}</span>
                <small
                    v-if="item.supplierName"
                    class="detail-supplier"
                >
                    {{ item.supplierName }}
                </small>
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
                {{ currencyText(item.maxUnitCost) }}
            </template>
            <template
                v-for="{ key } in amountColumns"
                :key="key"
                #[`item.${key}`]="{ value }"
            >
                {{ currencyText(value) }}
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
            <template #[`item.name`]="{ item }">
                <span>{{ item.name }}</span>
                <small
                    v-if="item.supplierName"
                    class="detail-supplier"
                >
                    {{ item.supplierName }}
                </small>
            </template>
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
    <RecordTotals
        v-if="canReadCosts"
        class="issue-totals"
        label="Totales de salida"
        :fields="totals"
    />
    <p
        v-if="canReadCosts && resource === 'wastes' && rows.some((row) => row.maxUnitCost != null)"
        class="text-caption mt-2"
    >
        Importes de referencia con el costo vigente de la merma.
    </p>
</template>

<style scoped>
.detail-supplier {
    display: block;
    color: rgb(var(--v-theme-muted));
    font-size: 0.8rem;
}
.issue-totals {
    margin-block-start: 1rem;
}
</style>
