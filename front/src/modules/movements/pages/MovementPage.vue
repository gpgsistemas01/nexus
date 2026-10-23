<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { usePagedList } from '../../../shared/composables/usePagedList.js';
import { useListSearch } from '../../../shared/composables/useListSearch.js';
import { useVisibleRefresh } from '../../../shared/composables/useVisibleRefresh.js';
import { useReportScope } from '../../../shared/composables/useReportScope.js';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import { initialRecordQuery } from '../../../shared/list.js';
import { dateRangeError } from '../../../shared/report.js';
import { useMovementFilters } from '../composables/useMovementFilters.js';
import { movementService } from '../services/movementService.js';
import { emptyMovementFilters, MOVEMENT_CONFIG } from '../movement.js';
import type { MovementQuery, MovementRow, MovementResource } from '../movement.js';
import MovementFilters from '../components/MovementFilters.vue';
import MovementTable from '../components/MovementTable.vue';
import ReportScopeDialog from '../../../shared/components/ReportScopeDialog.vue';

const props = defineProps<{ resource: MovementResource }>();
const config = MOVEMENT_CONFIG[props.resource];
const { has, onDenied, onError } = usePageAccess();
const canExport = computed(() => has(PERMISSIONS.ADMIN_REPORTS_READ));
const filters = useMovementFilters(props.resource, has);
let lastAttemptAt = -Infinity;
const list = usePagedList<MovementQuery, MovementRow>({
    initialQuery: { ...initialRecordQuery(), ...emptyMovementFilters(), direction: 'desc' },
    canLoad: () => has(PERMISSIONS.MOVEMENTS_READ),
    request: (query, signal) => {
        lastAttemptAt = Date.now();
        return movementService.list(props.resource, query, signal);
    },
    errorMessage: 'No se pudieron cargar los movimientos.',
    onError,
});
const { query, rows, total, isLoading, isRefreshing, error } = list;
const searchForm = useListSearch(list, () => ({ ...filters.values }));
const { search, clearSearch } = searchForm;
const filterError = ref('');
const report = useReportScope({
    canExport: () => canExport.value,
    filename: `reporte_movimientos_${props.resource}.xlsx`,
    request: (scope, signal) => movementService.export(props.resource, { ...query }, scope, signal),
    onDenied,
});
const {
    isExporting,
    exportError,
    isReportOpen,
    reportValues,
    reportFormError,
    openReport,
    exportReport,
    setReportMode,
    setReportMonth,
} = report;

const applySearch = () => {
    filterError.value = dateRangeError(filters.values);
    if (!filterError.value) searchForm.applySearch();
};

const clear = () => {
    filters.clear();
    filterError.value = '';
    clearSearch(emptyMovementFilters());
};

useVisibleRefresh({
    refresh: list.refresh,
    lastAttemptAt: () => lastAttemptAt,
    canRefresh: () =>
        has(PERMISSIONS.MOVEMENTS_READ) &&
        !isLoading.value &&
        !isRefreshing.value &&
        !isReportOpen.value &&
        !isExporting.value,
});
onMounted(() => {
    document.title = `Nexus | ${config.title}`;
});
</script>

<template>
    <MovementFilters
        v-model:search="search"
        :values="filters.values"
        :suppliers="filters.supplierState.value"
        :items="filters.itemState.value"
        :can-select-supplier="filters.canSelectSupplier.value"
        :can-select-item="filters.canSelectItem.value"
        :item-label="config.itemLabel"
        :is-loading="isLoading"
        :error="filterError"
        @update="filters.update"
        @search-options="(lookup, value) => filters[lookup].updateSearch(value)"
        @more="filters[$event].loadMore()"
        @retry="filters[$event].retry()"
        @apply="applySearch"
        @clear="clear"
        @refresh="list.load"
    />
    <RecordListPanel
        v-model:search="search"
        :title="config.title"
        title-prefix="Historial de"
        :title-id="`movements-${resource}-title`"
        :total="total"
        :is-loading="isLoading"
        :is-refreshing="isRefreshing"
        :error="error"
        hide-search
        loading-label="Cargando movimientos…"
        @refresh="list.load"
    >
        <template #actions>
            <VBtn
                v-if="canExport"
                variant="outlined"
                :loading="isExporting"
                @click="openReport"
            >
                Exportar Excel
            </VBtn>
        </template>
        <MovementTable
            :resource="resource"
            :query="query"
            :rows="rows"
            :total="total"
            :is-loading="isLoading"
            @query="list.applyQuery"
        />
    </RecordListPanel>
    <ReportScopeDialog
        v-if="isReportOpen"
        eyebrow="MOVIMIENTOS"
        subject="movimientos"
        :values="reportValues"
        :is-submitting="isExporting"
        :error="reportFormError || exportError"
        @mode="setReportMode"
        @month="setReportMonth"
        @submit="exportReport"
        @close="isReportOpen = false"
    />
</template>
