<script setup lang="ts">
import { PERMISSIONS } from '@nexus/permissions';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VTextField } from 'vuetify/components/VTextField';
import { VSnackbar } from 'vuetify/components/VSnackbar';
import InventoryTable from '../components/InventoryTable.vue';
import InventoryReportToolbar from '../components/InventoryReportToolbar.vue';
import RemoteSelect from '../components/RemoteSelect.vue';
import InventoryEditorPage from './InventoryEditorPage.vue';
import { useAuthSession } from '../../auth/session.js';
import { useInventory } from '../composables/useInventory.js';
import type { InventoryResource } from '../inventory.js';

const props = defineProps<{ resource: InventoryResource }>();
const router = useRouter();
const session = useAuthSession();
const unauthorized = () => {
    void router.replace({ name: 'login' });
};
const inventory = useInventory(props.resource, session.user.value!, unauthorized);
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
    notice,
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
        <header class="inventory-heading">
            <div>
                <p>ALMACÉN</p>
                <h1 :id="`inventory-${resource}-title`">{{ config.title }}</h1>
                <span>Consulta y administra las existencias por proveedor.</span>
            </div>
            <VBtn
                v-if="permissions.canWrite"
                color="primary"
                variant="flat"
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
        <VSnackbar
            :model-value="!!notice"
            :timeout="4500"
            color="success"
            @update:model-value="!$event && (notice = '')"
        >
            {{ notice }}
            <template #actions>
                <VBtn
                    variant="text"
                    @click="notice = ''"
                >
                    Cerrar aviso
                </VBtn>
            </template>
        </VSnackbar>
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
            <form
                class="inventory-filters"
                @submit.prevent="applySearch"
            >
                <VTextField
                    v-model="search"
                    label="Buscar por nombre"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    @click:clear="
                        search = '';
                        applySearch();
                    "
                />
                <RemoteSelect
                    v-if="session.user.value?.permissions.includes(PERMISSIONS.SUPPLIERS_READ)"
                    label="Filtrar por proveedor"
                    :model-value="query.supplierId"
                    :items="supplierItems"
                    :is-loading="supplierLoading"
                    :load-error="supplierError"
                    :has-more="supplierHasMore"
                    @update:model-value="inventory.applyQuery({ supplierId: $event })"
                    @search="inventory.suppliers.updateSearch"
                    @more="inventory.suppliers.loadMore"
                    @retry="inventory.suppliers.retry"
                />
                <VBtn
                    type="submit"
                    variant="tonal"
                    :loading="isLoading"
                >
                    Buscar
                </VBtn>
                <VBtn
                    variant="text"
                    :disabled="isLoading"
                    @click="inventory.load"
                >
                    Actualizar
                </VBtn>
            </form>
            <InventoryReportToolbar
                v-if="permissions.canExport"
                v-model:scope="reportScope"
                :has-supplier-filter="!!query.supplierId"
                :is-exporting="isExporting"
                :error="exportError"
                @export="inventory.exportReport(reportScope)"
            />
            <p
                v-if="isLoading"
                role="status"
                class="loading-label"
            >
                Cargando inventario…
            </p>
            <InventoryTable
                :rows="rows"
                :permissions="permissions"
                :resource="resource"
                :total="total"
                :query="query"
                @query="inventory.applyQuery"
                :is-loading="isLoading"
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
        <InventoryEditorPage
            v-if="editor"
            :key="`${editor.action}:${editor.row?.id ?? 'new'}`"
            :resource="resource"
            :target="editor"
            :user-id="session.user.value!.id"
            @saved="inventory.onSaved"
            @close="editor = null"
            @reload="reloadEditor"
            @unauthorized="unauthorized"
        />
    </section>
</template>

<style scoped>
.inventory-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}
.inventory-heading p {
    color: #14844c;
    letter-spacing: 0.15em;
    font-size: 0.7rem;
    font-weight: 800;
    margin-bottom: 0.4rem;
}
h1 {
    font-size: clamp(1.4rem, 3vw, 1.75rem);
    color: #173b29;
    font-weight: 800;
    margin-bottom: 0.35rem;
}
.inventory-heading span {
    color: #64796c;
    font-size: 0.9rem;
}
.inventory-filters {
    display: grid;
    grid-template-columns: minmax(160px, 1fr) minmax(180px, 1fr) auto auto;
    gap: 1rem;
    align-items: start;
    margin-bottom: 1rem;
}
.loading-label {
    color: #456354;
    margin-bottom: 0.5rem;
}
@media (max-width: 700px) {
    .inventory-filters {
        grid-template-columns: 1fr;
    }
}
</style>
