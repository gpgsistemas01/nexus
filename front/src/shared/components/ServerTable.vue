<script setup lang="ts" generic="Row extends { id: string }">
import { VDataTableServer } from 'vuetify/components/VDataTable';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
withDefaults(
    defineProps<{
        headers: DataTableHeader<Row>[];
        rows: Row[];
        total: number;
        page: number;
        pageSize: number;
        isLoading: boolean;
        sortBy?: DataTableSortItem[];
        mustSort?: boolean;
        rowProps?: (data: { item: Row }) => { class: string };
    }>(),
    { sortBy: () => [], mustSort: false, rowProps: undefined },
);
const emit = defineEmits<{
    options: [options: { page: number; itemsPerPage: number; sortBy: DataTableSortItem[] }];
}>();
</script>
<template>
    <div
        class="server-table"
        :aria-busy="isLoading"
    >
        <VDataTableServer
            :headers="headers"
            :items="rows"
            :items-length="total"
            item-value="id"
            :page="page"
            :items-per-page="pageSize"
            :sort-by="sortBy"
            :row-props="rowProps"
            :loading="isLoading"
            :mobile="false"
            density="compact"
            :must-sort="mustSort"
            :items-per-page-options="[10, 20, 50]"
            items-per-page-text="Registros por página:"
            page-text="{0}–{1} de {2}"
            first-page-label="Primera página"
            prev-page-label="Anterior"
            next-page-label="Siguiente"
            last-page-label="Última página"
            loading-text="Cargando registros…"
            no-data-text="No hay registros para estos filtros."
            @update:options="emit('options', $event)"
        >
            <template
                v-for="(_, name) in $slots"
                #[name]="slotProps"
                ><slot
                    :name="name"
                    v-bind="slotProps"
            /></template>
        </VDataTableServer>
    </div>
</template>
<style scoped>
.server-table {
    min-width: 0;
    border: 1px solid rgb(var(--v-theme-table-border));
    border-radius: 0.75rem;
    background: white;
    overflow: hidden;
}
.server-table :deep(th) {
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
.server-table :deep(th:hover) {
    background: rgb(var(--v-theme-table-header-hover)) !important;
}
.server-table :deep(th .v-icon) {
    color: white;
}
.server-table :deep(td) {
    font-size: 0.8rem;
    border-right: 1px solid rgba(var(--v-theme-table-border), 0.45);
    border-bottom: 1px solid rgba(var(--v-theme-table-border), 0.6);
    text-align: center;
    padding: 0.65rem 0.75rem;
}
.server-table :deep(tbody tr:nth-child(even) td) {
    background: rgb(var(--v-theme-table-alt));
}
.server-table :deep(tbody tr:hover td) {
    background: rgb(var(--v-theme-table-hover));
}
.server-table :deep(.v-data-table-footer) {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.65rem;
    font-size: 0.75rem;
    border-top: 1px solid rgba(var(--v-theme-table-border), 0.6);
}
.server-table :deep(.v-data-table-footer__pagination .v-btn) {
    border: 1px solid rgb(var(--v-theme-table-border));
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-primary));
    box-shadow: 0 0.2rem 0.45rem rgba(var(--v-theme-on-surface), 0.08);
    margin-inline: 0.15rem;
}
.server-table :deep(.v-data-table-footer__pagination .v-btn:disabled) {
    opacity: 0.4;
    box-shadow: none;
}
</style>
