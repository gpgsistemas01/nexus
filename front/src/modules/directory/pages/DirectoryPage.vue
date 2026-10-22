<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { PERMISSIONS } from '@nexus/permissions';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import { usePagedList } from '../../../shared/composables/usePagedList.js';
import { useFileExport } from '../../../shared/composables/useFileExport.js';
import { initialRecordQuery } from '../../../shared/list.js';
import type { RecordQuery } from '../../../shared/list.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { showSuccess } from '../../../shared/ui/feedback.js';
import { useAuthSession } from '../../auth/session.js';
import { DIRECTORY_CONFIG } from '../directory.js';
import type { DirectoryResource, DirectoryTarget, DirectoryEntry } from '../directory.js';
import { directoryService } from '../services/directoryService.js';
import DirectoryTable from '../components/DirectoryTable.vue';
import DirectoryEditorPage from './DirectoryEditorPage.vue';

const props = defineProps<{ resource: DirectoryResource }>();
const config = DIRECTORY_CONFIG[props.resource];
const session = useAuthSession();
const router = useRouter();

const has = (permission: string) => !!session.user.value?.permissions.includes(permission);

const canRead = computed(() => has(config.read));
const canCreate = computed(() => has(config.create));
const canEdit = computed(() => has(config.update));
const canExport = computed(() => has(config.report));

const onDenied = (status: number) =>
    void router.replace(
        status === 401
            ? { name: 'login', query: { returnTo: router.currentRoute.value.fullPath } }
            : { name: 'forbidden' },
    );

const list = usePagedList<RecordQuery, DirectoryEntry>({
    initialQuery: initialRecordQuery(),
    canLoad: () => canRead.value,
    request: (query, signal) => directoryService.list(props.resource, query, signal),
    errorMessage: 'No se pudo cargar el directorio.',
    onError: (cause) => {
        if (cause instanceof ApiError && [401, 403].includes(cause.status)) onDenied(cause.status);
    },
});
const { rows, query, total, isLoading, error } = list;
const report = useFileExport<void>({
    canExport: () => canExport.value,
    filename: `reporte_${props.resource}.xlsx`,
    request: (_, signal) => directoryService.export(props.resource, { ...query }, signal),
    onDenied,
});
const { isExporting, exportError } = report;
const search = ref('');
const editor = shallowRef<DirectoryTarget | null>(null);

const openEditor = (target: DirectoryTarget) => {
    if (target.action === 'create' ? canCreate.value : canEdit.value) editor.value = target;
};

const applySearch = () => {
    if (query.search === search.value && query.page === 1) void list.load();
    else list.applyQuery({ search: search.value });
};

const clear = () => {
    search.value = '';
    list.applyQuery({ search: '' });
};

const reload = () => {
    editor.value = null;
    void list.load();
};

const onSaved = () => {
    reload();
    void showSuccess('El registro se guardó correctamente.');
};

onMounted(() => {
    document.title = `Nexus | ${config.title}`;
});
</script>

<template>
    <RecordListPanel
        v-model:search="search"
        :title="config.title"
        :title-id="`directory-${resource}-title`"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        @search="applySearch"
        @clear="clear"
        @refresh="list.load"
    >
        <template #actions>
            <VBtn
                v-if="canExport"
                variant="outlined"
                :loading="isExporting"
                @click="report.exportReport()"
            >
                Exportar Excel
            </VBtn>
            <VBtn
                v-if="canCreate"
                color="primary"
                prepend-icon="$plus"
                @click="openEditor({ action: 'create' })"
            >
                {{ config.createLabel }}
            </VBtn>
        </template>
        <template #messages>
            <VAlert
                v-if="exportError"
                type="error"
                role="alert"
                class="mb-4"
            >
                {{ exportError }}
            </VAlert>
        </template>
        <DirectoryTable
            v-if="canRead"
            :resource="resource"
            :rows="rows"
            :query="query"
            :total="total"
            :is-loading="isLoading"
            :can-edit="canEdit"
            :can-see-state="resource === 'clients' || has(PERMISSIONS.CATALOGS_MANAGE)"
            @query="list.applyQuery"
            @edit="openEditor({ action: 'edit', row: $event })"
        />
        <VAlert
            v-else
            type="info"
        >
            Tu cuenta no tiene permiso para consultar este listado.
        </VAlert>
    </RecordListPanel>
    <DirectoryEditorPage
        v-if="editor"
        :resource="resource"
        :target="editor"
        @saved="onSaved"
        @close="editor = null"
        @reload="reload"
        @denied="onDenied"
    />
</template>
