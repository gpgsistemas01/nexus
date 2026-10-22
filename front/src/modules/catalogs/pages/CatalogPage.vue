<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { VBtn } from 'vuetify/components/VBtn';
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { useListEditor } from '../../../shared/composables/useListEditor.js';
import { useListSearch } from '../../../shared/composables/useListSearch.js';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import CatalogTable from '../components/CatalogTable.vue';
import CatalogEditorPage from './CatalogEditorPage.vue';
import { catalogDefinition } from '../catalog.js';
import { useCatalogList } from '../composables/useCatalogList.js';
import type { CatalogName, CatalogTarget } from '../catalog.js';

const props = defineProps<{ catalog: CatalogName }>();
const { has, onDenied } = usePageAccess();
const canManage = computed(() => has(PERMISSIONS.CATALOGS_MANAGE));
const definition = catalogDefinition(props.catalog);
const list = useCatalogList(props.catalog, onDenied);
const { query, rows, total, isLoading, error } = list;
const { search, applySearch } = useListSearch(list);
const { editor, openEditor, closeEditor, reloadEditor, onSaved } = useListEditor<CatalogTarget>({
    canOpen: () => canManage.value,
    reload: list.load,
    savedMessage: 'El catálogo se guardó correctamente.',
});

const clearSearch = () => {
    search.value = '';
    list.applyQuery({ search: '' });
};

onMounted(() => {
    document.title = `Nexus | ${definition.label}`;
});
</script>

<template>
    <RecordListPanel
        v-model:search="search"
        :title="definition.label"
        :title-id="`catalog-${catalog}-title`"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        loading-label="Cargando catálogo…"
        @search="applySearch"
        @clear="clearSearch"
        @refresh="list.load"
    >
        <template #actions>
            <VBtn
                v-if="canManage"
                color="primary"
                variant="flat"
                prepend-icon="$plus"
                @click="openEditor({ action: 'create' })"
            >
                {{ definition.createButtonLabel }}
            </VBtn>
        </template>
        <CatalogTable
            :rows="rows"
            :total="total"
            :query="query"
            :is-loading="isLoading"
            :has-symbol="definition.fields.includes('symbol')"
            @query="list.applyQuery"
            @edit="openEditor({ action: 'edit', row: $event })"
        />
    </RecordListPanel>
    <CatalogEditorPage
        v-if="editor"
        :catalog="catalog"
        :target="editor"
        @saved="onSaved"
        @close="closeEditor"
        @reload="reloadEditor"
        @denied="onDenied"
    />
</template>
