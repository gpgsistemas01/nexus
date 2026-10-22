<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { PERMISSIONS } from '@nexus/permissions';
import { VBtn } from 'vuetify/components/VBtn';
import { VTextField } from 'vuetify/components/VTextField';
import { VAlert } from 'vuetify/components/VAlert';
import { VCard, VCardText } from 'vuetify/components/VCard';
import { useAuthSession } from '../../auth/session.js';
import { showSuccess } from '../../../shared/ui/feedback.js';
import FilterActions from '../../../shared/components/FilterActions.vue';
import CatalogTable from '../components/CatalogTable.vue';
import CatalogEditorPage from './CatalogEditorPage.vue';
import { catalogDefinition } from '../catalog.js';
import { useCatalogList } from '../composables/useCatalogList.js';
import type { CatalogName, CatalogTarget } from '../catalog.js';

const props = defineProps<{ catalog: CatalogName }>();
const router = useRouter();
const session = useAuthSession();
const canManage = computed(() =>
    session.user.value?.permissions.includes(PERMISSIONS.CATALOGS_MANAGE),
);
const definition = catalogDefinition(props.catalog);

const onDenied = (status: number) =>
    void router.replace(
        status === 401
            ? { name: 'login', query: { returnTo: router.currentRoute.value.fullPath } }
            : { name: 'forbidden' },
    );

const list = useCatalogList(props.catalog, onDenied);
const { query, rows, total, isLoading, error } = list;
const search = ref('');
const editor = shallowRef<CatalogTarget | null>(null);

const openEditor = (target: CatalogTarget) => {
    if (canManage.value) editor.value = target;
};

const applySearch = () => {
    if (query.search === search.value && query.page === 1) void list.load();
    else list.applyQuery({ search: search.value });
};

const clearSearch = () => {
    search.value = '';
    list.applyQuery({ search: '' });
};

const reload = () => {
    editor.value = null;
    void list.load();
};

const onSaved = () => {
    reload();
    void showSuccess('El catálogo se guardó correctamente.');
};

onMounted(() => {
    document.title = `Nexus | ${definition.label}`;
});
</script>

<template>
    <section :aria-labelledby="`catalog-${catalog}-title`">
        <VCard class="catalog-sheet">
            <VCardText>
                <header class="catalog-heading">
                    <h1 :id="`catalog-${catalog}-title`">Tabla de {{ definition.label }}</h1>
                    <VBtn
                        v-if="canManage"
                        color="primary"
                        variant="flat"
                        prepend-icon="$plus"
                        @click="openEditor({ action: 'create' })"
                    >
                        {{ definition.createButtonLabel }}
                    </VBtn>
                </header>
                <form
                    class="catalog-search"
                    @submit.prevent="applySearch"
                >
                    <VTextField
                        v-model="search"
                        label="Buscar por nombre"
                        clearable
                        @click:clear="clearSearch"
                    />
                    <FilterActions
                        :is-loading="isLoading"
                        @refresh="list.load"
                        @clear="clearSearch"
                    />
                </form>
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
                        @click="list.load"
                    >
                        Reintentar
                    </VBtn>
                </VAlert>
                <p
                    class="catalog-count"
                    role="status"
                >
                    {{ isLoading ? 'Cargando catálogo…' : `Registros encontrados: ${total}` }}
                </p>
                <CatalogTable
                    :rows="rows"
                    :total="total"
                    :query="query"
                    :is-loading="isLoading"
                    :has-symbol="definition.fields.includes('symbol')"
                    @query="list.applyQuery"
                    @edit="openEditor({ action: 'edit', row: $event })"
                />
            </VCardText>
        </VCard>
        <CatalogEditorPage
            v-if="editor"
            :catalog="catalog"
            :target="editor"
            @saved="onSaved"
            @close="editor = null"
            @reload="reload"
            @denied="onDenied"
        />
    </section>
</template>

<style scoped>
.catalog-sheet {
    border: 1px solid rgba(var(--v-theme-primary), 0.16);
    border-radius: 1.25rem;
    box-shadow: 0 1rem 2.25rem rgba(var(--v-theme-on-surface), 0.08);
}
.catalog-sheet > :deep(.v-card-text) {
    padding: clamp(1rem, 2vw, 1.5rem);
}
.catalog-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.catalog-heading h1 {
    flex: 1 1 15rem;
    font-size: clamp(1.35rem, 2vw, 1.75rem);
    font-weight: 800;
    text-align: center;
}
.catalog-search {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.65rem;
    margin-bottom: 1rem;
}
.catalog-search :deep(.v-input) {
    flex: 1 1 240px;
}
.catalog-count {
    color: rgb(var(--v-theme-muted));
    font-size: 0.8rem;
    margin-bottom: 0.6rem;
}
@media (max-width: 600px) {
    .catalog-search :deep(.filter-actions) {
        flex: 1 1 100%;
    }
}
</style>
