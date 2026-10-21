<script setup lang="ts">
import { PERMISSIONS } from '@nexus/permissions';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VTextField } from 'vuetify/components/VTextField';
import { VSelect } from 'vuetify/components/VSelect';
import InventoryTable from '../components/InventoryTable.vue';
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
const { config, permissions, query, rows, total, isLoading, isExporting, error, notice, editor } =
    inventory;
const supplierItems = inventory.suppliers.items;
const supplierLoading = inventory.suppliers.isLoading;
const supplierError = inventory.suppliers.error;
const supplierHasMore = inventory.suppliers.hasMore;
const search = ref('');
const reportScope = ref('activeOrStock');
const pages = computed(() => Math.max(1, Math.ceil(total.value / query.length)));
const applySearch = () => inventory.applyQuery({ search: search.value });
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
                >{{
                    resource === 'wastes'
                        ? 'Nueva merma'
                        : resource === 'consumables'
                          ? 'Nuevo consumible'
                          : 'Nuevo material'
                }}</VBtn
            >
        </header>
        <VAlert
            v-if="notice"
            type="success"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="notice = ''"
            >{{ notice }}</VAlert
        >
        <VAlert
            v-if="error"
            role="alert"
            type="error"
            variant="tonal"
            class="mb-4"
            >{{ error }}
            <VBtn
                variant="text"
                @click="inventory.load"
                >Reintentar</VBtn
            ></VAlert
        >
        <template v-if="permissions.canRead">
            <form
                class="inventory-filters"
                @submit.prevent="applySearch"
            >
                <VTextField
                    v-model="search"
                    label="Buscar por nombre"
                    variant="outlined"
                    density="comfortable"
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
                    :error="supplierError"
                    :has-more="supplierHasMore"
                    @update:model-value="inventory.applyQuery({ supplierId: $event })"
                    @search="inventory.suppliers.updateSearch"
                    @more="inventory.suppliers.loadMore"
                />
                <VBtn
                    type="submit"
                    variant="tonal"
                    :loading="isLoading"
                    >Buscar</VBtn
                >
                <VBtn
                    variant="text"
                    :disabled="isLoading"
                    @click="inventory.load"
                    >Actualizar</VBtn
                >
            </form>
            <div
                v-if="permissions.canExport"
                class="inventory-export"
            >
                <span
                    v-if="query.supplierId"
                    class="report-note"
                    >El Excel incluye todos los proveedores del tipo seleccionado.</span
                >
                <VSelect
                    v-model="reportScope"
                    label="Incluir en Excel"
                    :items="[
                        { title: 'Activos o con stock', value: 'activeOrStock' },
                        { title: 'Activos', value: 'active' },
                        { title: 'Con stock', value: 'inStock' },
                    ]"
                    variant="outlined"
                    density="compact"
                    hide-details
                />
                <VBtn
                    variant="text"
                    color="primary"
                    :loading="isExporting"
                    @click="inventory.exportReport(reportScope)"
                    >Descargar Excel</VBtn
                >
            </div>
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
                :is-waste="resource === 'wastes'"
                :is-loading="isLoading"
                @action="inventory.openEditor"
            />
            <footer class="inventory-pagination">
                <span>{{ total }} registros · Página {{ query.page }} de {{ pages }}</span>
                <div>
                    <VBtn
                        variant="text"
                        :disabled="query.page <= 1 || isLoading"
                        @click="inventory.applyQuery({ page: query.page - 1 })"
                        >Anterior</VBtn
                    ><VBtn
                        variant="text"
                        :disabled="query.page >= pages || isLoading"
                        @click="inventory.applyQuery({ page: query.page + 1 })"
                        >Siguiente</VBtn
                    >
                </div>
                <VSelect
                    :model-value="query.length"
                    label="Registros por página"
                    :items="[10, 20, 50]"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="inventory.applyQuery({ length: $event })"
                />
            </footer>
        </template>
        <VAlert
            v-else
            type="info"
            variant="tonal"
            >Tu cuenta puede acceder a este módulo, pero no tiene permiso para consultar sus
            existencias.</VAlert
        >
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
    margin-bottom: 2rem;
}
.inventory-heading p {
    color: #14844c;
    letter-spacing: 0.15em;
    font-size: 0.7rem;
    font-weight: 800;
    margin-bottom: 0.4rem;
}
h1 {
    font-size: clamp(1.7rem, 3vw, 2.2rem);
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
.inventory-export {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
.inventory-export :deep(.v-input) {
    max-width: 230px;
}
.inventory-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 0;
    color: #456354;
    font-size: 0.85rem;
}
.inventory-pagination :deep(.v-input) {
    flex: 0 1 180px;
}
.loading-label {
    color: #456354;
    margin-bottom: 0.5rem;
}
@media (max-width: 700px) {
    .inventory-filters {
        grid-template-columns: 1fr;
    }
    .inventory-export {
        flex-wrap: wrap;
        justify-content: flex-start;
    }
}
</style>
