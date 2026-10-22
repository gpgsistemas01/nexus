<script setup lang="ts">
import { computed, ref } from 'vue';
import { VDataTableServer } from 'vuetify/components/VDataTable';
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
        <VDataTableServer
            :headers="headers"
            :items="rows"
            :items-length="total"
            item-value="id"
            :page="query.page"
            :items-per-page="query.length"
            :sort-by="sortBy"
            :row-props="rowProps"
            :loading="isLoading"
            :mobile="false"
            density="compact"
            must-sort
            :items-per-page-options="[10, 20, 50]"
            items-per-page-text="Registros por página:"
            page-text="{0}–{1} de {2}"
            first-page-label="Primera página"
            prev-page-label="Anterior"
            next-page-label="Siguiente"
            last-page-label="Última página"
            loading-text="Cargando inventario…"
            no-data-text="No hay registros para estos filtros."
            @update:options="updateOptions"
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
        </VDataTableServer>
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
    border: 1px solid rgb(var(--v-theme-table-border));
    border-radius: 0.75rem;
    background: white;
    overflow: hidden;
}
.inventory-table :deep(th) {
    color: white;
    font-weight: 700;
    font-size: 0.76rem;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 2px solid rgb(var(--v-theme-table-header-hover));
    background: linear-gradient(
        180deg,
        rgb(var(--v-theme-table-header-top)),
        rgb(var(--v-theme-table-header))
    ) !important;
    text-align: center;
}
.inventory-table :deep(th:hover) {
    background: rgb(var(--v-theme-table-header-hover)) !important;
}
.inventory-table :deep(th .v-icon) {
    color: white;
}
.inventory-table :deep(td) {
    font-size: 0.8rem;
    border-right: 1px solid rgba(var(--v-theme-table-border), 0.45);
    border-bottom: 1px solid rgba(var(--v-theme-table-border), 0.6);
    text-align: center;
    padding: 0.65rem 0.75rem;
}
.inventory-table :deep(tbody tr:nth-child(even) td) {
    background: rgb(var(--v-theme-table-alt));
}
.inventory-table :deep(tbody tr:hover td) {
    background: rgb(var(--v-theme-table-hover));
}
.inventory-table :deep(.low-stock td) {
    background: #fff8e5;
}
.inventory-table :deep(.v-data-table-footer) {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.65rem;
    font-size: 0.75rem;
    border-top: 1px solid rgba(var(--v-theme-table-border), 0.6);
}
.item-identity {
    text-align: left;
    min-width: 160px;
    padding: 0.35rem 0;
}
.inventory-table :deep(.v-data-table-footer__pagination .v-btn) {
    border: 1px solid rgb(var(--v-theme-table-border));
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-primary));
    box-shadow: 0 0.2rem 0.45rem rgba(var(--v-theme-on-surface), 0.08);
    margin-inline: 0.15rem;
}
.inventory-table :deep(.v-data-table-footer__pagination .v-btn:disabled) {
    opacity: 0.4;
    box-shadow: none;
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
