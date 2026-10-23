<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { useIssueEditor } from '../composables/useIssueEditor.js';
import { ISSUE_CONFIG } from '../issueConfig.js';
import { getIssueReturnableQuantity } from '../issueRules.js';
import type { IssueResource, IssueTarget, IssueHeaderSelect, IssueDetail } from '../issue.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';
import type { LookupItem } from '../../../shared/lookup.js';
import IssueEditor from '../components/IssueEditor.vue';
import IssueLineEntryPage from './IssueLineEntryPage.vue';
import IssueReturnPage from './IssueReturnPage.vue';

const props = defineProps<{ resource: IssueResource; target: IssueTarget }>();
const emit = defineEmits<{
    saved: [result: MutationConfirmation];
    close: [];
    reload: [];
    createClient: [onCreated: (item: LookupItem) => void];
}>();
const { has, onDenied } = usePageAccess();
const editor = useIssueEditor({
    ...props,
    has,
    onSaved: (result) => emit('saved', result),
    onDenied,
});
const returnDetail = shallowRef<IssueDetail>();
const { headerSelection } = editor;
const selects = computed<IssueHeaderSelect[]>(() => [
    {
        field: 'clientId',
        kind: 'clients',
        label: 'Cliente',
        state: headerSelection.clients.state.value,
        initialOption: headerSelection.initialOptions.value.clientId,
        isDisabled: !headerSelection.canReadClients.value,
        hint: !headerSelection.canReadClients.value ? 'Sin permiso para consultar clientes.' : '',
    },
    {
        field: 'advisorId',
        kind: 'advisors',
        label: 'Asesor',
        state: headerSelection.advisors.state.value,
        initialOption: headerSelection.initialOptions.value.advisorId,
        isDisabled: !headerSelection.canReadPersons.value || !editor.values.clientId,
        hint: !editor.values.clientId ? 'Seleccione un cliente antes de buscar asesor.' : '',
    },
    {
        field: 'departmentId',
        kind: 'departments',
        label: 'Área',
        state: headerSelection.departments.state.value,
        initialOption: headerSelection.initialOptions.value.departmentId,
        isDisabled: !headerSelection.canReadDepartments.value,
        hint: !headerSelection.canReadDepartments.value ? 'Sin permiso para consultar áreas.' : '',
    },
    {
        field: 'requesterId',
        kind: 'requesters',
        label: 'Solicitante',
        state: headerSelection.requesters.state.value,
        initialOption: headerSelection.initialOptions.value.requesterId,
        isDisabled: !headerSelection.canReadPersons.value || !editor.values.departmentId,
        hint: !editor.values.departmentId ? 'Seleccione un área antes de buscar solicitante.' : '',
    },
]);
const issueDocument = props.target.document;
const mode = props.target.mode;
const entityLabel = props.resource === 'wastes' ? 'salida de merma' : 'salida';
const editorActionLabels = {
    create: 'Registrar',
    edit: 'Editar',
    header: 'Editar',
    view: 'Consultar',
    supply: 'Surtir',
    return: 'Devolver',
};
const title = `${editorActionLabels[mode]} ${entityLabel}${issueDocument ? ` - Folio ${issueDocument.referenceNumber}` : ''}`;
const canReadItems = computed(() =>
    has(props.resource === 'wastes' ? PERMISSIONS.WASTES_READ : PERMISSIONS.MATERIALS_READ),
);

const openReturnDialog = (line: IssueDetail) => {
    if (
        mode === 'return' &&
        issueDocument &&
        has(ISSUE_CONFIG[props.resource].supplyPermission) &&
        !line.isCanceled &&
        getIssueReturnableQuantity(line) > 0
    )
        returnDetail.value = line;
};
</script>

<template>
    <IssueEditor
        :title="title"
        :values="editor.values"
        :errors="editor.errors.value"
        :message="editor.message.value"
        :is-submitting="editor.isSubmitting.value"
        :is-conflicted="editor.isConflicted.value"
        :can-edit-header="editor.canEditHeader"
        :can-edit-details="editor.canEditDetails"
        :mode="mode"
        :item-label="ISSUE_CONFIG[resource].item"
        :selects="selects"
        @update="editor.update"
        @blur="editor.blur"
        @search="(kind, value) => headerSelection[kind].updateSearch(value)"
        @more="headerSelection[$event].loadMore()"
        @retry="headerSelection[$event].retry()"
        @remove="editor.removeDetail"
        @supply="editor.updateDetailSupply"
        @return="openReturnDialog"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    >
        <template #client-action>
            <VBtn
                v-if="
                    editor.canEditHeader &&
                    has(PERMISSIONS.CLIENTS_CREATE) &&
                    has(PERMISSIONS.CLIENTS_READ)
                "
                size="small"
                variant="text"
                :disabled="editor.isSubmitting.value"
                @click="emit('createClient', headerSelection.selectCreatedClient)"
            >
                Registrar cliente
            </VBtn>
        </template>
        <template #entry>
            <IssueLineEntryPage
                :resource="resource"
                :is-disabled="editor.isSubmitting.value"
                :can-read="canReadItems"
                @add="editor.addDetail"
            />
        </template>
    </IssueEditor>
    <IssueReturnPage
        v-if="returnDetail && issueDocument"
        :key="returnDetail.id"
        :resource="resource"
        :document="issueDocument"
        :detail="returnDetail"
        @saved="emit('saved', $event)"
        @close="returnDetail = undefined"
        @denied="onDenied"
    />
</template>
