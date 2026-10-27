<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { usePagedList } from '../../../shared/composables/usePagedList.js';
import { useListSearch } from '../../../shared/composables/useListSearch.js';
import { useReportScope } from '../../../shared/composables/useReportScope.js';
import { useVisibleRefresh } from '../../../shared/composables/useVisibleRefresh.js';
import { initialRecordQuery } from '../../../shared/list.js';
import { dateRangeError } from '../../../shared/report.js';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import ReportScopeDialog from '../../../shared/components/ReportScopeDialog.vue';
import { issueService } from '../services/issueService.js';
import { useIssueFilters } from '../composables/useIssueFilters.js';
import { useIssueActions } from '../composables/useIssueActions.js';
import { emptyIssueFilters } from '../issueForm.js';
import { ISSUE_CONFIG } from '../issueConfig.js';
import type { IssueResource, IssueQuery, IssueRow } from '../issue.js';
import type { LookupCreation } from '../../../shared/lookup.js';
import IssueTable from '../components/IssueTable.vue';
import IssueFilters from '../components/IssueFilters.vue';
import IssueEditorPage from './IssueEditorPage.vue';

const props = defineProps<{ resource: IssueResource }>();
const emit = defineEmits<{ createClient: [request: LookupCreation] }>();
const config = ISSUE_CONFIG[props.resource];
const { has, onDenied, onError } = usePageAccess();
const canManage = computed(() => has(config.managePermission));
const canSupply = computed(() => has(config.supplyPermission));
const canExport = computed(() => has(PERMISSIONS.WAREHOUSE_REPORTS_READ));
const filters = useIssueFilters(props.resource, has);
let lastAttemptAt = -Infinity;
const list = usePagedList<IssueQuery, IssueRow>({
    initialQuery: {
        ...initialRecordQuery(),
        ...emptyIssueFilters(),
        orderColumn: 1,
        direction: 'desc',
    },
    canLoad: () => canManage.value,
    request: (query, signal) => {
        lastAttemptAt = Date.now();
        return issueService.list(props.resource, query, signal);
    },
    errorMessage: 'No se pudieron cargar las salidas.',
    onError,
});
const { query, rows, total, isLoading, isRefreshing, error } = list;
const searchForm = useListSearch(list, () => ({ ...filters.values }));
const { search } = searchForm;
const filterError = ref('');

const applySearch = () => {
    filterError.value = dateRangeError(filters.values);
    if (!filterError.value) searchForm.applySearch();
};

const clear = () => {
    filters.clear();
    filterError.value = '';
    searchForm.clearSearch({ ...filters.values });
};

const actions = useIssueActions({
    resource: props.resource,
    canManage: () => canManage.value,
    canSupply: () => canSupply.value,
    canRead: () => canManage.value,
    reload: list.load,
    onError,
});
const { editor, editorKey, isReading, readError } = actions;
const report = useReportScope({
    canExport: () => canExport.value,
    filename: `reporte_salidas_${config.path}.xlsx`,
    request: (scope, signal) => issueService.export(props.resource, { ...query }, scope, signal),
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
useVisibleRefresh({
    refresh: list.refresh,
    lastAttemptAt: () => lastAttemptAt,
    canRefresh: () =>
        canManage.value &&
        !editor.value &&
        !isReading.value &&
        !isReportOpen.value &&
        !isExporting.value &&
        !isLoading.value &&
        !isRefreshing.value,
});
onMounted(() => {
    document.title = `Nexus | ${config.title}`;
});
</script>

<template>
    <IssueFilters
        v-model:search="search"
        :values="filters.values"
        :selects="filters.selects.value"
        :is-loading="isLoading"
        :is-department-locked="filters.isDepartmentLocked.value"
        :error="filterError"
        @update="(field, value) => (filters.values[field] = value)"
        @search-options="(kind, value) => filters.lookups[kind].updateSearch(value)"
        @more="filters.lookups[$event].loadMore()"
        @retry="filters.lookups[$event].retry()"
        @apply="applySearch"
        @clear="clear"
        @refresh="list.load"
    />
    <RecordListPanel
        v-model:search="search"
        :title="config.title"
        :title-id="`issues-${resource}-title`"
        :total="total"
        :is-loading="isLoading"
        :is-refreshing="isRefreshing"
        :error="error"
        :show-count="canManage"
        hide-search
        loading-label="Cargando salidas…"
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
            <VBtn
                v-if="canManage"
                color="primary"
                prepend-icon="$plus"
                :disabled="isReading"
                @click="actions.create"
            >
                Nueva salida
            </VBtn>
        </template>
        <template #messages>
            <VAlert
                v-if="isReading"
                role="status"
                type="info"
                variant="tonal"
                class="mb-4"
            >
                Cargando salida…
            </VAlert>
            <VAlert
                v-if="readError"
                role="alert"
                type="error"
                variant="tonal"
                class="mb-4"
            >
                {{ readError }}
                <VBtn
                    variant="text"
                    @click="actions.retry"
                >
                    Reintentar consulta
                </VBtn>
            </VAlert>
        </template>
        <IssueTable
            v-if="canManage"
            :rows="rows"
            :query="query"
            :total="total"
            :is-loading="isLoading"
            :is-reading="isReading"
            :can-manage="canManage"
            :can-supply="canSupply"
            :is-waste="resource === 'wastes'"
            @query="list.applyQuery"
            @open="actions.open"
        />
        <VAlert
            v-else
            type="info"
            variant="tonal"
        >
            No tienes permiso para consultar salidas.
        </VAlert>
    </RecordListPanel>
    <IssueEditorPage
        v-if="editor"
        :key="editorKey"
        :resource="resource"
        :target="editor"
        @saved="actions.handleSaved"
        @close="actions.close"
        @reload="
            actions.close();
            list.load();
        "
        @create-client="emit('createClient', $event)"
    />
    <ReportScopeDialog
        v-if="isReportOpen"
        eyebrow="SALIDAS"
        subject="salidas"
        :values="reportValues"
        :is-submitting="isExporting"
        :error="reportFormError || exportError"
        @mode="setReportMode"
        @month="setReportMonth"
        @submit="exportReport"
        @close="isReportOpen = false"
    />
</template>
