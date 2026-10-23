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
import { purchaseService } from '../services/purchaseService.js';
import { usePurchaseFilters } from '../composables/usePurchaseFilters.js';
import { usePurchaseActions } from '../composables/usePurchaseActions.js';
import { emptyPurchaseFilters } from '../purchaseForm.js';
import { PURCHASE_CONFIG } from '../purchaseConfig.js';
import type {
    PurchaseResource,
    PurchaseQuery,
    PurchaseRow,
    CreatedOption,
    ItemCreation,
} from '../purchase.js';
import PurchaseTable from '../components/PurchaseTable.vue';
import PurchaseFilters from '../components/PurchaseFilters.vue';
import PurchaseEditorPage from './PurchaseEditorPage.vue';
import PurchaseCorrectionPage from './PurchaseCorrectionPage.vue';

const props = defineProps<{ resource: PurchaseResource }>();
const emit = defineEmits<{
    createSupplier: [onCreated: CreatedOption];
    createItem: [request: ItemCreation];
}>();
const config = PURCHASE_CONFIG[props.resource];
const { has, onDenied, onError } = usePageAccess();
const canManage = computed(() => has(PERMISSIONS.GOODS_RECEIPTS_MANAGE));
const canExport = computed(() => has(PERMISSIONS.WAREHOUSE_REPORTS_READ));
const filters = usePurchaseFilters(props.resource, has);
let lastAttemptAt = -Infinity;
const list = usePagedList<PurchaseQuery, PurchaseRow>({
    initialQuery: { ...initialRecordQuery(), ...emptyPurchaseFilters(), direction: 'desc' },
    canLoad: () => canManage.value,
    request: (query, signal) => {
        lastAttemptAt = Date.now();
        return purchaseService.list(props.resource, query, signal);
    },
    errorMessage: 'No se pudieron cargar las compras.',
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
    searchForm.clearSearch(emptyPurchaseFilters());
};

const actions = usePurchaseActions({
    resource: props.resource,
    canManage: () => canManage.value,
    reload: list.load,
    onError,
});
const { editor, editorKey, isReading, readError, correction } = actions;
const report = useReportScope({
    canExport: () => canExport.value,
    filename: `reporte_compras_${config.path}.xlsx`,
    request: (scope, signal) => purchaseService.export(props.resource, { ...query }, scope, signal),
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
    <PurchaseFilters
        v-model:search="search"
        :values="filters.values"
        :suppliers="filters.suppliers.state.value"
        :persons="filters.persons.state.value"
        :can-suppliers="filters.canSuppliers.value"
        :can-persons="filters.canPersons.value"
        :is-loading="isLoading"
        :error="filterError"
        @update="(field, value) => (filters.values[field] = value)"
        @search-options="(kind, value) => filters[kind].updateSearch(value)"
        @more="filters[$event].loadMore()"
        @retry="filters[$event].retry()"
        @apply="applySearch"
        @clear="clear"
        @refresh="list.load"
    />
    <RecordListPanel
        v-model:search="search"
        :title="config.title"
        :title-id="`purchases-${resource}-title`"
        :total="total"
        :is-loading="isLoading"
        :is-refreshing="isRefreshing"
        :error="error"
        :show-count="canManage"
        hide-search
        loading-label="Cargando compras…"
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
                Nueva compra
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
                Cargando compra…
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
        <PurchaseTable
            v-if="canManage"
            :rows="rows"
            :query="query"
            :total="total"
            :is-loading="isLoading"
            :is-reading="isReading"
            @query="list.applyQuery"
            @open="actions.open"
        />
        <VAlert
            v-else
            type="info"
        >
            Tu cuenta no tiene permiso para consultar compras.
        </VAlert>
    </RecordListPanel>
    <PurchaseEditorPage
        v-if="editor"
        :key="editorKey"
        :resource="resource"
        :target="editor"
        :is-changing="actions.isChanging.value"
        :read-error="readError"
        :can-change-details="!isReading && !actions.isChanging.value && !actions.needsReload.value"
        @saved="actions.handleSaved"
        @close="actions.close"
        @reload="actions.reload"
        @correct="actions.correct"
        @cancel="actions.cancel"
        @create-supplier="emit('createSupplier', $event)"
        @create-item="emit('createItem', $event)"
    />
    <PurchaseCorrectionPage
        v-if="correction && editor && editor.action !== 'create'"
        :resource="resource"
        :document="editor.document"
        :detail="correction"
        @saved="actions.handleDetailSaved"
        @close="correction = undefined"
        @reload="
            correction = undefined;
            actions.reload();
        "
    />
    <ReportScopeDialog
        v-if="isReportOpen"
        eyebrow="COMPRAS"
        subject="compras"
        :values="reportValues"
        :is-submitting="isExporting"
        :error="reportFormError || exportError"
        @mode="setReportMode"
        @month="setReportMonth"
        @submit="exportReport"
        @close="isReportOpen = false"
    />
</template>
