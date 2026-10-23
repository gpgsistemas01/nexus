<script setup lang="ts">
import DirectoryForm from '../components/DirectoryForm.vue';
import { useDirectoryEditor } from '../composables/useDirectoryEditor.js';
import { DIRECTORY_CONFIG } from '../directory.js';
import type { DirectoryResource, DirectoryTarget, DirectoryEntry } from '../directory.js';

const props = defineProps<{ resource: DirectoryResource; target: DirectoryTarget }>();
const emit = defineEmits<{
    saved: [entry?: DirectoryEntry];
    close: [];
    reload: [];
    denied: [status: number];
}>();
const editor = useDirectoryEditor({
    ...props,
    onSaved: (entry) => emit('saved', entry),
    onDenied: (status) => emit('denied', status),
});
const { values, errors, message, isSubmitting, isConflicted } = editor;
const title = `${props.target.action === 'create' ? 'Registrar' : 'Editar'} ${DIRECTORY_CONFIG[props.resource].singular}`;
</script>

<template>
    <DirectoryForm
        :resource="resource"
        :title="title"
        :values="values"
        :errors="errors"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :is-editing="target.action === 'edit'"
        @update="editor.update"
        @blur="editor.blur"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
