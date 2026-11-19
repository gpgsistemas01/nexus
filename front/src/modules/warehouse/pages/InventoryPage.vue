<script setup lang="ts">
import { PERMISSIONS } from '@nexus/permissions';
import { defineAsyncComponent, onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import InventoryTable from '../components/InventoryTable.vue';
import InventoryFilters from '../components/InventoryFilters.vue';
import ReportScopeDialog from '../../../shared/components/ReportScopeDialog.vue';
import InventoryEditorPage from './InventoryEditorPage.vue';
import { useAuthSession } from '../../auth/session.js';
import { useListSearch } from '../../../shared/composables/useListSearch.js';
import { useInventory } from '../composables/useInventory.js';
import { directoryService } from '../../directory/services/directoryService.js';
import { initialRecordQuery } from '../../../shared/list.js';
import { showSuccess } from '../../../shared/ui/feedback.js';
import { ApiError } from '../../../shared/http/apiError.js';
import type { InventoryResource, InventoryRow } from '../inventory.js';
import type { CatalogEntry, CatalogTarget } from '../../catalogs/catalog.js';
import type { DirectoryTarget } from '../../directory/directory.js';
import type { LookupCreation } from '../../../shared/lookup.js';

const props = defineProps<{ resource: InventoryResource }>();

const emit = defineEmits<{
    createSupplier: [request: LookupCreation];
    createArticle: [request: LookupCreation];
}>();

const InventoryImportPage = defineAsyncComponent(() => import('./InventoryImportPage.vue'));
const CatalogEditorPage = defineAsyncComponent(
    () => import('../../catalogs/pages/CatalogEditorPage.vue'),
);
const DirectoryEditorPage = defineAsyncComponent(
    () => import('../../directory/pages/DirectoryEditorPage.vue'),
);

const router = useRouter();
const session = useAuthSession();
const inventory = useInventory(props.resource, session.user.value!, () => {
    void router.replace({ name: 'login' });
});
const {
    config,
    permissions,
    query,
    rows,
    total,
    isLoading,
    isRefreshing,
    isExporting,
    error,
    exportError,
    isReportOpen,
    reportValues,
    editor,
    isImportOpen,
} = inventory;
const { search, applySearch, clearSearch } = useListSearch(inventory);
const catalogEditor = shallowRef<CatalogTarget | null>(null);
const directoryEditor = shallowRef<DirectoryTarget | null>(null);
const isOpeningRelatedEditor = ref(false);
const relatedEditorError = ref('');

const clearFilters = () => {
    inventory.suppliers.updateSearch('');
    clearSearch({ supplierId: '' });
};

const reloadEditor = () => {
    editor.value = null;
    void inventory.load();
};

const reloadRelatedEditor = () => {
    catalogEditor.value = null;
    directoryEditor.value = null;
    editor.value = null;
    void inventory.load();
};

const openRelatedEditor = async (kind: 'article' | 'supplier', row: InventoryRow) => {
    if (isOpeningRelatedEditor.value) return;

    relatedEditorError.value = '';

    if (kind === 'article') {
        if (row.materialVersion == null) {
            relatedEditorError.value = 'Actualiza el inventario para abrir el artículo.';
            return;
        }

        const article: CatalogEntry = {
            id: row.entityId,
            version: row.materialVersion,
            name: row.name,
            symbol: '',
            type: props.resource === 'consumables' ? 'CONSUMABLE' : 'MATERIAL',
            hasSuppliers: true,
            hasHistory: true,
            presentationId: row.presentationId,
            unitMeasureId: row.unitMeasureId,
            presentation: row.presentation,
            unitMeasure: row.unitMeasure,
            base: row.base == null ? '' : String(row.base),
            height: row.height == null ? '' : String(row.height),
            minStock: row.minStock == null ? '' : String(row.minStock),
        };

        catalogEditor.value = { action: 'edit', row: article };
        return;
    }

    isOpeningRelatedEditor.value = true;

    try {
        const result = await directoryService.list('suppliers', {
            ...initialRecordQuery(),
            search: row.supplierName,
            length: 20,
        });
        const supplier = result.data.find((item) => item.id === row.supplierId);

        if (!supplier) {
            relatedEditorError.value =
                'No se encontró el proveedor de esta existencia. Actualiza el inventario e inténtalo de nuevo.';
            return;
        }

        directoryEditor.value = { action: 'edit', row: supplier };
    } catch (cause) {
        if (cause instanceof ApiError && [401, 403].includes(cause.status)) {
            void router.replace({
                name: cause.status === 401 ? 'login' : 'forbidden',
                query: { returnTo: router.currentRoute.value.fullPath },
            });
            return;
        }

        relatedEditorError.value =
            cause instanceof Error ? cause.message : 'No se pudo cargar el proveedor.';
    } finally {
        isOpeningRelatedEditor.value = false;
    }
};

const onRelatedSaved = (kind: 'article' | 'supplier') => {
    catalogEditor.value = null;
    directoryEditor.value = null;
    editor.value = null;
    void inventory.load();
    void showSuccess(
        kind === 'article'
            ? 'El artículo se guardó correctamente.'
            : 'El proveedor se guardó correctamente.',
    );
};

const onRelatedDenied = (status: number) => {
    if (status !== 401 && status !== 403) return;

    void router.replace({
        name: status === 401 ? 'login' : 'forbidden',
        query: { returnTo: router.currentRoute.value.fullPath },
    });
};

onMounted(() => {
    document.title = `Nexus | ${config.title}`;
});
</script>

<template>
    <InventoryFilters
        v-if="permissions.canRead"
        v-model:search="search"
        :supplier-id="query.supplierId"
        :can-filter-supplier="
            !!session.user.value?.permissions.includes(PERMISSIONS.SUPPLIERS_READ)
        "
        :is-loading="isLoading"
        :suppliers="inventory.suppliers.state.value"
        @supplier="inventory.applyQuery({ supplierId: $event })"
        @search-options="inventory.suppliers.updateSearch"
        @more="inventory.suppliers.loadMore"
        @retry="inventory.suppliers.retry"
        @apply="applySearch"
        @clear="clearFilters"
        @refresh="inventory.load"
    />
    <RecordListPanel
        v-model:search="search"
        :title="config.title"
        :title-id="`inventory-${resource}-title`"
        :total="total"
        :is-loading="isLoading"
        :is-refreshing="isRefreshing"
        :show-count="permissions.canRead"
        :error="error"
        loading-label="Cargando inventario…"
        hide-search
        @refresh="inventory.load"
    >
        <template #actions>
            <VBtn
                v-if="
                    permissions.canRead &&
                    ((permissions.canWrite && permissions.canReadCosts) || permissions.canAdjust)
                "
                variant="outlined"
                @click="isImportOpen = true"
            >
                Importar Excel
            </VBtn>
            <VBtn
                v-if="permissions.canRead && permissions.canExport"
                variant="outlined"
                :loading="isExporting"
                @click="inventory.openReport()"
            >
                Exportar Excel
            </VBtn>
            <VBtn
                v-if="permissions.canWrite"
                color="primary"
                variant="flat"
                prepend-icon="$plus"
                @click="inventory.openEditor({ action: 'create' })"
            >
                {{ resource === 'wastes' ? 'Nueva merma' : 'Nueva existencia' }}
            </VBtn>
        </template>
        <InventoryTable
            v-if="permissions.canRead"
            :rows="rows"
            :permissions="permissions"
            :resource="resource"
            :total="total"
            :query="query"
            :is-loading="isLoading"
            @query="inventory.applyQuery"
            @action="inventory.openEditor"
        />
        <VAlert
            v-else
            type="info"
            variant="tonal"
        >
            Tu cuenta puede acceder a este módulo, pero no tiene permiso para consultar sus
            existencias.
        </VAlert>
    </RecordListPanel>
    <ReportScopeDialog
        v-if="isReportOpen"
        kind="inventory"
        :values="reportValues"
        :is-submitting="isExporting"
        :error="exportError"
        :note="
            query.supplierId ? 'El Excel incluye todos los proveedores del tipo seleccionado.' : ''
        "
        @inventory="inventory.setInventoryScope"
        @submit="inventory.exportReport"
        @close="isReportOpen = false"
    />
    <InventoryEditorPage
        v-if="editor"
        :key="`${editor.action}:${editor.row?.id ?? 'new'}`"
        :resource="resource"
        :target="editor"
        :user-id="session.user.value!.id"
        :can-add-stock="permissions.canAdd"
        :can-create-supplier="
            session.user.value!.permissions.includes(PERMISSIONS.SUPPLIERS_MANAGE) &&
            session.user.value!.permissions.includes(PERMISSIONS.SUPPLIERS_READ)
        "
        :can-create-article="
            session.user.value!.permissions.includes(PERMISSIONS.MATERIAL_CATALOGS_MANAGE)
        "
        :can-edit-supplier="
            session.user.value!.permissions.includes(PERMISSIONS.SUPPLIERS_PAGE_VIEW) &&
            session.user.value!.permissions.includes(PERMISSIONS.SUPPLIERS_UPDATE) &&
            session.user.value!.permissions.includes(PERMISSIONS.SUPPLIERS_READ)
        "
        :is-opening-related-editor="isOpeningRelatedEditor"
        :action-error="relatedEditorError"
        @create-article="emit('createArticle', $event)"
        @create-supplier="emit('createSupplier', $event)"
        @edit-article="openRelatedEditor('article', $event)"
        @edit-supplier="openRelatedEditor('supplier', $event)"
        @saved="inventory.onSaved"
        @close="editor = null"
        @reload="reloadEditor"
        @unauthorized="router.replace({ name: 'login' })"
        @add-stock="inventory.openEditor"
    />
    <CatalogEditorPage
        v-if="catalogEditor"
        catalog="materials"
        :target="catalogEditor"
        @saved="onRelatedSaved('article')"
        @close="catalogEditor = null"
        @reload="reloadRelatedEditor"
        @denied="onRelatedDenied"
    />
    <DirectoryEditorPage
        v-if="directoryEditor"
        resource="suppliers"
        :target="directoryEditor"
        @saved="onRelatedSaved('supplier')"
        @close="directoryEditor = null"
        @reload="reloadRelatedEditor"
        @denied="onRelatedDenied"
    />
    <InventoryImportPage
        v-if="isImportOpen"
        :resource="resource"
        :user-id="session.user.value!.id"
        :can-read-suppliers="session.user.value!.permissions.includes(PERMISSIONS.SUPPLIERS_READ)"
        :can-edit-data="permissions.canWrite && permissions.canReadCosts"
        :can-adjust="permissions.canAdjust"
        :initial-supplier-id="query.supplierId"
        :initial-search="query.search"
        @close="isImportOpen = false"
        @saved="inventory.load()"
        @unauthorized="router.replace({ name: 'login' })"
    />
</template>
