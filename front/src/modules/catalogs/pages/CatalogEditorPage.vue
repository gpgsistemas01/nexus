<script setup lang="ts">
import CatalogForm from '../components/CatalogForm.vue';
import { catalogDefinition } from '../catalog.js';
import { useCatalogEditor } from '../composables/useCatalogEditor.js';
import type { CatalogName, CatalogTarget } from '../catalog.js';

const props = defineProps<{ catalog: CatalogName; target: CatalogTarget }>();
const emit = defineEmits<{ saved: []; close: []; reload: []; denied: [status: number] }>();
const definition = catalogDefinition(props.catalog);
const editor = useCatalogEditor({
    ...props,
    onSaved: () => emit('saved'),
    onDenied: (status) => emit('denied', status),
});
const { values, errors, message, isSubmitting, isConflicted } = editor;
const isEditing = props.target.action === 'edit';
const title = `${isEditing ? 'Editar' : 'Registrar'} ${definition.entityLabel}`;
</script>

<template>
    <CatalogForm
        :title="title"
        :values="values"
        :errors="errors"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :has-symbol="definition.fields.includes('symbol')"
        :max-name-length="definition.maxLengths.name"
        :max-symbol-length="definition.maxLengths.symbol"
        :is-editing="isEditing"
        :can-edit-identity="editor.canEditIdentity"
        :is-material="catalog === 'materials'"
        :presentations="editor.lookups.presentationId.state.value"
        :units="editor.lookups.unitMeasureId.state.value"
        :selected-presentation="editor.selectedPresentation.value"
        :selected-unit="editor.selectedUnit.value"
        :fixed-measurements="editor.fixedMeasurements.value"
        @search="(field, value) => editor.lookups[field].updateSearch(value)"
        @more="editor.lookups[$event].loadMore()"
        @retry="editor.lookups[$event].retry()"
        @update="editor.update"
        @blur="editor.blur"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
