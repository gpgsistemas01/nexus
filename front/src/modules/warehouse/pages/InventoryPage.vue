<script setup lang="ts">
import { PERMISSIONS } from '@nexus/permissions';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import InventoryTable from '../components/InventoryTable.vue';
import InventoryFilters from '../components/InventoryFilters.vue';
import InventoryReportToolbar from '../components/InventoryReportToolbar.vue';
import InventoryEditorPage from './InventoryEditorPage.vue';
import { useAuthSession } from '../../auth/session.js';
import { useListSearch } from '../../../shared/composables/useListSearch.js';
import { useInventory } from '../composables/useInventory.js';
import type { InventoryResource } from '../inventory.js';

const props = defineProps<{ resource: InventoryResource }>();
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
    editor,
} = inventory;
const { search, applySearch, clearSearch } = useListSearch(inventory);
const reportScope = ref('activeOrStock');

const clearFilters = () => {
    inventory.suppliers.updateSearch('');
    clearSearch({ supplierId: '' });
};

const reloadEditor = () => {
    editor.value = null;
    void inventory.load();
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
        :title="config.tableTitle"
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
                v-if="permissions.canWrite"
                color="primary"
                variant="flat"
                prepend-icon="$plus"
                @click="inventory.openEditor({ action: 'create' })"
            >
                {{
                    resource === 'wastes'
                        ? 'Nueva merma'
                        : resource === 'consumables'
                          ? 'Nuevo consumible'
                          : 'Nuevo material'
                }}
            </VBtn>
        </template>
        <template #messages>
            <InventoryReportToolbar
                v-if="permissions.canRead && permissions.canExport"
                v-model:scope="reportScope"
                :has-supplier-filter="!!query.supplierId"
                :is-exporting="isExporting"
                :error="exportError"
                @export="inventory.exportReport(reportScope)"
            />
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
    <InventoryEditorPage
        v-if="editor"
        :key="`${editor.action}:${editor.row?.id ?? 'new'}`"
        :resource="resource"
        :target="editor"
        :user-id="session.user.value!.id"
        :can-add-stock="permissions.canAdd"
        @saved="inventory.onSaved"
        @close="editor = null"
        @reload="reloadEditor"
        @unauthorized="router.replace({ name: 'login' })"
        @add-stock="inventory.openEditor"
    />
</template>
