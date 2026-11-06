<script setup lang="ts">
import { usePersonEditor } from '../composables/usePersonEditor.js';
import PersonForm from '../components/PersonForm.vue';
import type { PersonTarget } from '../identity.js';
import type { OrganizationResource } from '../../../shared/lookup.js';

const props = defineProps<{ target: PersonTarget; permissions: readonly string[] }>();
const emit = defineEmits<{ saved: []; close: []; reload: []; denied: [status: number] }>();
const editor = usePersonEditor({
    ...props,
    onSaved: () => emit('saved'),
    onDenied: (status) => emit('denied', status),
});
const { values, errors, message, isSubmitting, isConflicted, departmentId, roleId, accessError } =
    editor;
const options = editor.organization.state;
const title = props.target.action === 'create' ? 'Registrar persona' : 'Editar persona';

const search = (resource: OrganizationResource, value: string) =>
    editor.organization[resource].updateSearch(value);

const updateDraft = (field: 'departmentId' | 'roleId', value: string) => {
    if (field === 'departmentId') departmentId.value = value;
    else roleId.value = value;

    accessError.value = '';
};
</script>

<template>
    <PersonForm
        :title="title"
        :values="values"
        :errors="errors"
        :department-id="departmentId"
        :role-id="roleId"
        :access-error="accessError"
        :options="options"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :is-editing="target.action !== 'create'"
        @update="editor.update"
        @blur="editor.blur"
        @draft="updateDraft"
        @add="editor.addAccess"
        @remove="editor.removeAccess"
        @search="search"
        @more="editor.organization[$event].loadMore()"
        @retry="editor.organization[$event].retry()"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
