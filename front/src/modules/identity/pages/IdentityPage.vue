<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { VBtn } from 'vuetify/components/VBtn';
import { VAlert } from 'vuetify/components/VAlert';
import { PERMISSIONS } from '@nexus/permissions';
import RecordListPanel from '../../../shared/components/RecordListPanel.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import { usePagedList } from '../../../shared/composables/usePagedList.js';
import { useOrganizationOptions } from '../../../shared/composables/useOrganizationOptions.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { useFileExport } from '../../../shared/composables/useFileExport.js';
import { initialRecordQuery } from '../../../shared/list.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { showSuccess } from '../../../shared/ui/feedback.js';
import { useAuthSession } from '../../auth/session.js';
import { IDENTITY_CONFIG } from '../identity.js';
import type { IdentityResource, IdentityEntry, IdentityTarget } from '../identity.js';
import { identityService } from '../services/identityService.js';
import type { IdentityQuery } from '../identity.js';
import IdentityTable from '../components/IdentityTable.vue';
import PersonEditorPage from './PersonEditorPage.vue';
import UserEditorPage from './UserEditorPage.vue';

const props = defineProps<{ resource: IdentityResource }>();
const config = IDENTITY_CONFIG[props.resource];
const session = useAuthSession();
const router = useRouter();

const has = (permission: string) => !!session.user.value?.permissions.includes(permission);

const canRead = computed(() => has(config.read));
const canWrite = computed(() => has(config.write));
const canExport = computed(() => has(config.report));

const onDenied = (status: number) =>
    void router.replace(
        status === 401
            ? { name: 'login', query: { returnTo: router.currentRoute.value.fullPath } }
            : { name: 'forbidden' },
    );

const list = usePagedList<IdentityQuery, IdentityEntry>({
    initialQuery: { ...initialRecordQuery(), department: '', role: '' },
    canLoad: () => canRead.value,
    request: (query, signal) => identityService.list(props.resource, query, signal),
    errorMessage: 'No se pudo cargar el listado.',
    onError: (cause) => {
        if (cause instanceof ApiError && [401, 403].includes(cause.status)) onDenied(cause.status);
    },
});
const { rows, total, isLoading, error, query } = list;
const filters = useOrganizationOptions(
    props.resource === 'persons' ? session.user.value!.permissions : [],
);
const options = filters.state;
const departmentId = ref('');
const roleId = ref('');
const selectedDepartment = useSelectedOption(filters.departments.items, () => departmentId.value);
const selectedRole = useSelectedOption(filters.roles.items, () => roleId.value);
const search = ref('');
const editor = shallowRef<IdentityTarget | null>(null);
const report = useFileExport<void>({
    canExport: () => canExport.value && !query.role,
    filename: `reporte_${props.resource}.xlsx`,
    request: (_, signal) => identityService.export(props.resource, { ...query }, signal),
    onDenied,
});
const { isExporting, exportError } = report;

const applySearch = () => {
    const changes = {
        search: search.value,
        department: selectedDepartment.value?.title ?? '',
        role: selectedRole.value?.title ?? '',
    };
    if (
        changes.search === query.search &&
        changes.department === query.department &&
        changes.role === query.role &&
        query.page === 1
    )
        void list.load();
    else list.applyQuery(changes);
};

const clear = () => {
    search.value = '';
    departmentId.value = '';
    roleId.value = '';
    list.applyQuery({ search: '', department: '', role: '' });
};

const openEditor = (target: IdentityTarget) => {
    if (canWrite.value && (target.action !== 'password' || props.resource === 'users'))
        editor.value = target;
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
        :title-id="`identity-${resource}-title`"
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
                :disabled="!!query.role"
                :loading="isExporting"
                @click="report.exportReport()"
            >
                Exportar Excel
            </VBtn>
            <VBtn
                v-if="canWrite"
                prepend-icon="$plus"
                color="primary"
                @click="openEditor({ action: 'create' })"
            >
                {{ config.createLabel }}
            </VBtn>
        </template>
        <template
            v-if="resource === 'persons' && canRead"
            #filters
        >
            <RemoteSelect
                v-if="has(PERMISSIONS.DEPARTMENTS_READ)"
                v-model="departmentId"
                label="Filtrar por área"
                :items="options.departments.items"
                :is-loading="options.departments.isLoading"
                :has-more="options.departments.hasMore"
                :load-error="options.departments.error"
                @search="filters.departments.updateSearch"
                @more="filters.departments.loadMore"
                @retry="filters.departments.retry"
            />
            <RemoteSelect
                v-if="has(PERMISSIONS.ROLES_READ)"
                v-model="roleId"
                label="Filtrar por rol"
                :items="options.roles.items"
                :is-loading="options.roles.isLoading"
                :has-more="options.roles.hasMore"
                :load-error="options.roles.error"
                @search="filters.roles.updateSearch"
                @more="filters.roles.loadMore"
                @retry="filters.roles.retry"
            />
        </template>
        <template #messages>
            <VAlert
                v-if="exportError"
                role="alert"
                type="error"
                class="mb-4"
            >
                {{ exportError }}
            </VAlert>
            <VAlert
                v-if="query.role && canExport"
                type="info"
                class="mb-4"
            >
                Limpia el filtro de rol para exportar las responsabilidades por área.
            </VAlert>
        </template>
        <IdentityTable
            v-if="canRead"
            :resource="resource"
            :rows="rows"
            :total="total"
            :query="query"
            :is-loading="isLoading"
            :can-edit="canWrite"
            @query="list.applyQuery"
            @edit="openEditor({ action: 'edit', row: $event })"
            @password="openEditor({ action: 'password', row: $event })"
        />
        <VAlert
            v-else
            type="info"
        >
            Tu cuenta no tiene permiso para consultar este listado.
        </VAlert>
    </RecordListPanel>
    <PersonEditorPage
        v-if="editor && resource === 'persons' && editor.action !== 'password'"
        :target="editor"
        :permissions="session.user.value!.permissions"
        @saved="onSaved"
        @close="editor = null"
        @reload="reload"
        @denied="onDenied"
    />
    <UserEditorPage
        v-if="editor && resource === 'users'"
        :target="editor"
        :permissions="session.user.value!.permissions"
        @saved="onSaved"
        @close="editor = null"
        @reload="reload"
        @denied="onDenied"
    />
</template>
