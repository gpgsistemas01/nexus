<script setup lang="ts">
import { computed, ref } from 'vue';
import ServerTable from '../../../shared/components/ServerTable.vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VChip } from 'vuetify/components/VChip';
import { VDialog } from 'vuetify/components/VDialog';
import { VCard, VCardTitle, VCardText, VCardActions } from 'vuetify/components/VCard';
import type { DataTableSortItem } from 'vuetify';
import InventoryRowActions from './InventoryRowActions.vue';
import {
    currencyText,
    inventoryHeaders,
    INVENTORY_SORT_COLUMNS,
    numberText,
} from '../inventoryTable.js';
import type {
    EditorTarget,
    InventoryPermissions,
    InventoryQuery,
    InventoryResource,
    InventoryRow,
} from '../inventory.js';

const props = defineProps<{
    rows: InventoryRow[];
    permissions: InventoryPermissions;
    resource: InventoryResource;
    isLoading: boolean;
    total: number;
    query: InventoryQuery;
}>();
const emit = defineEmits<{
    action: [target: EditorTarget];
    query: [query: Partial<InventoryQuery>];
}>();
const headers = computed(() => inventoryHeaders(props.resource, props.permissions));
const sortBy = computed<DataTableSortItem[]>(() => [
    {
        key:
            Object.keys(INVENTORY_SORT_COLUMNS).find(
                (key) => INVENTORY_SORT_COLUMNS[key] === (props.query.orderColumn ?? 0),
            ) ?? 'name',
        order: props.query.direction,
    },
]);
const details = ref<InventoryRow | null>(null);

const updateOptions = (options: {
    page: number;
    itemsPerPage: number;
    sortBy: DataTableSortItem[];
}) => {
    const sorting = options.sortBy[0];
    emit('query', {
        page: options.page,
        length: options.itemsPerPage,
        orderColumn: INVENTORY_SORT_COLUMNS[sorting?.key ?? 'name'] ?? 0,
        direction: sorting?.order === 'desc' ? 'desc' : 'asc',
    });
};

const rowProps = ({ item }: { item: InventoryRow }) => ({
    class: Number(item.currentStock) < Number(item.minStock) ? 'low-stock' : '',
});
</script>

<template>
    <div
        class="inventory-table"
        :aria-busy="isLoading"
    >
        <ServerTable
            :headers="headers"
            :rows="rows"
            :total="total"
            :page="query.page"
            :page-size="query.length"
            :sort-by="sortBy"
            :row-props="rowProps"
            :is-loading="isLoading"
            must-sort
            @options="updateOptions"
        >
            <template #[`item.name`]="{ item }">
                <div class="item-identity">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.supplierName }}</span>
                </div>
                <VBtn
                    v-if="resource === 'wastes'"
                    size="x-small"
                    variant="text"
                    @click="details = item"
                >
                    Detalles de peso
                </VBtn>
            </template>
            <template
                v-for="key in ['base', 'height', 'minStock', 'convertedQuantity'] as const"
                #[`item.${key}`]="{ item }"
            >
                {{ numberText(item[key]) }}
            </template>
            <template #[`item.currentStock`]="{ item }">
                <strong>{{ numberText(item.currentStock) }}</strong>
                <VChip
                    v-if="Number(item.currentStock) < Number(item.minStock)"
                    color="warning"
                    size="x-small"
                    class="ms-1"
                >
                    Stock bajo
                </VChip>
            </template>
            <template #[`item.maxUnitCost`]="{ item }">
                {{ currencyText(item.maxUnitCost) }}
            </template>
            <template #[`item.isActive`]="{ item }">{{ item.isActive ? 'Sí' : 'No' }}</template>
            <template
                v-for="key in ['coneWeightKg', 'totalWeightKg', 'weightKg'] as const"
                #[`item.${key}`]="{ item }"
            >
                {{ item.presentation.toUpperCase() === 'ROLLO' ? numberText(item[key]) : '—' }}
            </template>
            <template #[`item.actions`]="{ item }">
                <InventoryRowActions
                    :row="item"
                    :permissions="permissions"
                    :is-waste="resource === 'wastes'"
                    @action="emit('action', $event)"
                />
            </template>
        </ServerTable>
        <VDialog
            :model-value="details !== null"
            max-width="480"
            @update:model-value="!$event && (details = null)"
        >
            <VCard
                v-if="details"
                role="dialog"
                aria-labelledby="weight-details-title"
            >
                <VCardTitle id="weight-details-title">Pesos de {{ details.name }}</VCardTitle>
                <VCardText>
                    <dl>
                        <dt>Rollo completo con cono (kg)</dt>
                        <dd>{{ numberText(details.referenceRollTotalWeightKg) }}</dd>
                        <dt>Referencia histórica: largo / peso neto</dt>
                        <dd>
                            {{ numberText(details.sampleLengthM) }} m /
                            {{ numberText(details.sampleNetWeightKg) }} kg
                        </dd>
                    </dl>
                </VCardText>
                <VCardActions><VBtn @click="details = null">Cerrar detalles</VBtn></VCardActions>
            </VCard>
        </VDialog>
    </div>
</template>

<style scoped>
.inventory-table {
    min-width: 0;
}
.inventory-table :deep(.low-stock td) {
    background: #fff8e5;
}
.item-identity {
    text-align: left;
    min-width: 160px;
    padding: 0.35rem 0;
}
.item-identity span {
    display: block;
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
}
dt {
    color: rgb(var(--v-theme-muted));
    margin-top: 0.7rem;
    font-size: 0.8rem;
}
dd {
    font-weight: 600;
}
</style>
