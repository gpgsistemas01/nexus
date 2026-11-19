<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
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
import { catalogService } from '../services/catalogService.js';
import { confirmAction } from '../../../shared/ui/feedback.js';
import { ApiError } from '../../../shared/http/apiError.js';
import type { CatalogEntry, CatalogName, CatalogTarget } from '../catalog.js';

const props = defineProps<{ catalog: CatalogName }>();
const { has, onDenied } = usePageAccess();
const canManage = computed(
    () =>
        has(PERMISSIONS.CATALOGS_MANAGE) ||
        has(
            props.catalog === 'materials'
                ? PERMISSIONS.MATERIAL_CATALOGS_MANAGE
                : PERMISSIONS.CATALOGS_MANAGE,
        ),
);
const definition = catalogDefinition(props.catalog);
const list = useCatalogList(props.catalog, onDenied);
const { query, rows, total, isLoading, error } = list;
const { search, applySearch, clearSearch } = useListSearch(list);
const { editor, openEditor, closeEditor, reloadEditor, onSaved } = useListEditor<CatalogTarget>({
    canOpen: () => canManage.value,
    reload: list.load,
    savedMessage:
        props.catalog === 'materials'
            ? 'El artículo se guardó correctamente.'
            : 'El catálogo se guardó correctamente.',
});

const removal = new AbortController();
const isRemoving = ref(false);

const removeArticle = async (entry: CatalogEntry) => {
    if (
        !canManage.value ||
        props.catalog !== 'materials' ||
        entry.hasSuppliers !== false ||
        entry.hasHistory ||
        isRemoving.value ||
        removal.signal.aborted
    )
        return;

    isRemoving.value = true;

    try {
        const confirmed = await confirmAction({
            title: `Eliminar artículo: ${entry.name}`,
            description:
                'El artículo se eliminará si no tiene proveedores vinculados ni historial de inventario.',
            signal: removal.signal,
            submit: async () => {
                try {
                    await catalogService.removeArticle(entry.id, removal.signal);
                } catch (cause) {
                    if (cause instanceof ApiError && [401, 403].includes(cause.status))
                        onDenied(cause.status);

                    throw cause;
                }
            },
        });
        if (confirmed) await list.load();
    } finally {
        isRemoving.value = false;
    }
};

onBeforeUnmount(() => removal.abort());

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
        :loading-label="catalog === 'materials' ? 'Cargando artículos…' : 'Cargando catálogo…'"
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
            :is-material="catalog === 'materials'"
            @query="list.applyQuery"
            @edit="openEditor({ action: 'edit', row: $event })"
            @remove="removeArticle"
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
