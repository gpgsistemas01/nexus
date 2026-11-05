<script setup lang="ts">
import { useUserEditor } from '../composables/useUserEditor.js';
import UserForm from '../components/UserForm.vue';
import type { IdentityTarget } from '../identity.js';
import type { OrganizationResource } from '../../../shared/lookup.js';

const props = defineProps<{ target: IdentityTarget; permissions: readonly string[] }>();
const emit = defineEmits<{ saved: []; close: []; reload: []; denied: [status: number] }>();
const editor = useUserEditor({
    ...props,
    onSaved: () => emit('saved'),
    onDenied: (status) => emit('denied', status),
});
const { values, errors, message, isSubmitting, isConflicted } = editor;
const options = editor.organization.state;
const title =
    props.target.action === 'password'
        ? 'Editar contraseña'
        : props.target.action === 'create'
          ? 'Registrar usuario'
          : 'Editar usuario';

const search = (resource: OrganizationResource, value: string) =>
    editor.organization[resource].updateSearch(value);
</script>

<template>
    <UserForm
        :action="target.action"
        :title="title"
        :row="target.action !== 'create' ? target.row : undefined"
        :values="values"
        :errors="errors"
        :options="options"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        @update="editor.update"
        @blur="editor.blur"
        @search="search"
        @more="editor.organization[$event].loadMore()"
        @retry="editor.organization[$event].retry()"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
