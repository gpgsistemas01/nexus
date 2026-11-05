<script setup lang="ts" generic="Row extends { id: string }">
import { VDataTableServer } from 'vuetify/components/VDataTable';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
import TableFrame from './TableFrame.vue';
import type { TableOptions } from '../composables/useTableQuery.js';

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
    options: [options: TableOptions];
}>();
</script>

<template>
    <TableFrame :is-loading="isLoading">
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
            >
                <slot
                    :name="name"
                    v-bind="slotProps"
                />
            </template>
        </VDataTableServer>
    </TableFrame>
</template>
