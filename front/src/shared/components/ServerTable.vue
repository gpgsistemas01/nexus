<script setup lang="ts" generic="Row extends { id: string }">
import { computed } from 'vue';
import { VDataTableServer } from 'vuetify/components/VDataTable';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
import TableFrame from './TableFrame.vue';
import ResponsiveTableCards from './ResponsiveTableCards.vue';
import type { TableOptions } from '../composables/useTableQuery.js';

const props = withDefaults(
    defineProps<{
        headers: DataTableHeader<Row>[];
        rows: Row[];
        total: number;
        page: number;
        pageSize: number;
        isLoading: boolean;
        pageSizeOptions?: number[];
        tableLabel?: string;
        sortBy?: DataTableSortItem[];
        mustSort?: boolean;
        rowProps?: (data: { item: Row }) => { class: string };
        formatValue?: (row: Row, key: string) => string;
    }>(),
    {
        pageSizeOptions: () => [10, 20, 50],
        tableLabel: undefined,
        sortBy: () => [],
        mustSort: false,
        rowProps: undefined,
        formatValue: undefined,
    },
);
const emit = defineEmits<{
    options: [options: TableOptions];
}>();
const headers = computed(() =>
    props.headers.map((header, index) => {
        if (header.key === 'actions') return { ...header, fixed: 'end' as const };

        return index === 0 ? { ...header, fixed: 'start' as const } : header;
    }),
);

const updateCardSort = (sortBy: DataTableSortItem[]) =>
    emit('options', { page: 1, itemsPerPage: props.pageSize, sortBy });
</script>

<template>
    <TableFrame
        :is-loading="isLoading"
        fit-columns
        mobile-cards
    >
        <VDataTableServer
            :headers="headers"
            :aria-label="tableLabel"
            :items="rows"
            :items-length="total"
            item-value="id"
            :page="page"
            :items-per-page="pageSize"
            :sort-by="sortBy"
            :row-props="rowProps"
            :loading="isLoading"
            :mobile="false"
            sort-by-text="Ordenar por"
            density="compact"
            :must-sort="mustSort"
            :items-per-page-options="pageSizeOptions"
            items-per-page-text="Registros por página:"
            page-text="Registros {0}–{1} de {2}"
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
            >
                <slot
                    :name="name"
                    v-bind="slotProps"
                />
            </template>
        </VDataTableServer>
        <ResponsiveTableCards
            :headers="headers"
            :rows="rows"
            :row-class="(row) => rowProps?.({ item: row }).class ?? ''"
            :format-value="formatValue"
            :sort-by="sortBy"
            @sort-by="updateCardSort"
        >
            <template
                v-for="(_, name) in $slots"
                #[name]="slotProps"
            >
                <slot
                    :name="name"
                    v-bind="slotProps"
                />
            </template>
        </ResponsiveTableCards>
        <p
            v-if="!isLoading"
            class="server-table__count"
            role="status"
            aria-live="polite"
        >
            {{ rows.length }} {{ rows.length === 1 ? 'registro' : 'registros' }} en esta página
        </p>
    </TableFrame>
</template>

<style scoped>
.server-table__count {
    margin: 0;
    border-top: 1px solid rgba(var(--v-theme-table-border), 0.6);
    padding: 0.65rem;
    color: rgb(var(--v-theme-muted));
    font-size: 0.8rem;
    text-align: center;
}
</style>
