<script setup lang="ts">
import { PERMISSIONS } from '@nexus/permissions';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VCard, VCardText } from 'vuetify/components/VCard';
import InventoryTable from '../components/InventoryTable.vue';
import InventoryFilters from '../components/InventoryFilters.vue';
import InventoryReportToolbar from '../components/InventoryReportToolbar.vue';
import InventoryEditorPage from './InventoryEditorPage.vue';
import { useAuthSession } from '../../auth/session.js';
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
    isExporting,
    error,
    exportError,
    editor,
} = inventory;
const supplierItems = inventory.suppliers.items;
const supplierLoading = inventory.suppliers.isLoading;
const supplierError = inventory.suppliers.error;
const supplierHasMore = inventory.suppliers.hasMore;
const search = ref('');
const reportScope = ref('activeOrStock');
const applySearch = () => {
    if (query.search === search.value && query.page === 1) void inventory.load();
    else inventory.applyQuery({ search: search.value });
};
const clearFilters = () => {
    search.value = '';
    inventory.suppliers.updateSearch('');
    inventory.applyQuery({ search: '', supplierId: '', page: 1 });
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
    <section :aria-labelledby="`inventory-${resource}-title`">
        <InventoryFilters
            v-if="permissions.canRead"
            v-model:search="search"
            :supplier-id="query.supplierId"
            :can-filter-supplier="
                !!session.user.value?.permissions.includes(PERMISSIONS.SUPPLIERS_READ)
            "
            :is-loading="isLoading"
            :suppliers="{
                items: supplierItems,
                isLoading: supplierLoading,
                error: supplierError,
                hasMore: supplierHasMore,
            }"
            @supplier="inventory.applyQuery({ supplierId: $event })"
            @search-options="inventory.suppliers.updateSearch"
            @more="inventory.suppliers.loadMore"
            @retry="inventory.suppliers.retry"
            @apply="applySearch"
            @clear="clearFilters"
            @refresh="inventory.load"
        />
        <VCard class="inventory-sheet">
            <VCardText>
                <header class="inventory-heading">
                    <div>
                        <p>ALMACÉN</p>
                        <h1 :id="`inventory-${resource}-title`">{{ config.title }}</h1>
                        <span>Existencias y movimientos por proveedor.</span>
                    </div>
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
                </header>
                <VAlert
                    v-if="error"
                    role="alert"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                >
                    {{ error }}
                    <VBtn
                        variant="text"
                        @click="inventory.load"
                    >
                        Reintentar
                    </VBtn>
                </VAlert>
                <template v-if="permissions.canRead">
                    <InventoryReportToolbar
                        v-if="permissions.canExport"
                        v-model:scope="reportScope"
                        :has-supplier-filter="!!query.supplierId"
                        :is-exporting="isExporting"
                        :error="exportError"
                        @export="inventory.exportReport(reportScope)"
                    />
                    <div
                        class="inventory-count"
                        role="status"
                    >
                        {{ isLoading ? 'Cargando inventario…' : `Registros encontrados: ${total}` }}
                    </div>
                    <InventoryTable
                        :rows="rows"
                        :permissions="permissions"
                        :resource="resource"
                        :total="total"
                        :query="query"
                        :is-loading="isLoading"
                        @query="inventory.applyQuery"
                        @action="inventory.openEditor"
                    />
                </template>
                <VAlert
                    v-else
                    type="info"
                    variant="tonal"
                >
                    Tu cuenta puede acceder a este módulo, pero no tiene permiso para consultar sus
                    existencias.
                </VAlert>
            </VCardText>
        </VCard>
        <InventoryEditorPage
            v-if="editor"
            :key="`${editor.action}:${editor.row?.id ?? 'new'}`"
            :resource="resource"
            :target="editor"
            :user-id="session.user.value!.id"
            @saved="inventory.onSaved"
            @close="editor = null"
            @reload="reloadEditor"
            @unauthorized="router.replace({ name: 'login' })"
        />
    </section>
</template>

<style scoped>
.inventory-sheet {
    border: 1px solid rgba(var(--v-theme-table-header), 0.16);
    border-radius: 1.25rem;
    background: linear-gradient(180deg, white, #f8fbf8);
    box-shadow: 0 1rem 2.25rem rgba(51, 45, 45, 0.08);
}
.inventory-sheet > :deep(.v-card-text) {
    padding: clamp(1rem, 2vw, 1.5rem);
}
.inventory-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}
.inventory-heading p {
    color: rgb(var(--v-theme-primary));
    letter-spacing: 0.15em;
    font-size: 0.65rem;
    font-weight: 800;
    margin-bottom: 0.4rem;
}
.inventory-heading h1 {
    font-size: clamp(1.35rem, 2vw, 1.75rem);
    color: rgb(var(--v-theme-on-surface));
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1.3;
    margin-bottom: 0.35rem;
}
.inventory-heading span {
    color: rgb(var(--v-theme-muted));
    font-size: 0.85rem;
}
.inventory-count {
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
    margin-bottom: 0.6rem;
}
</style>
