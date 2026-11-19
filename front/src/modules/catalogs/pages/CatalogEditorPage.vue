<script setup lang="ts">
import CatalogForm from '../components/CatalogForm.vue';
import { catalogDefinition } from '../catalog.js';
import { useCatalogEditor } from '../composables/useCatalogEditor.js';
import type { CatalogName, CatalogTarget, CatalogEntry } from '../catalog.js';

const props = defineProps<{ catalog: CatalogName; target: CatalogTarget }>();
const emit = defineEmits<{
    saved: [entry: CatalogEntry];
    close: [];
    reload: [];
    denied: [status: number];
}>();
const definition = catalogDefinition(props.catalog);
const editor = useCatalogEditor({
    ...props,
    onSaved: (entry) => emit('saved', entry),
    onDenied: (status) => emit('denied', status),
});
const { values, errors, message, isSubmitting, isConflicted } = editor;
const isEditing = props.target.action === 'edit';
const entityLabel =
    props.catalog === 'materials' && props.target.action === 'create' && props.target.materialType
        ? props.target.materialType === 'CONSUMABLE'
            ? 'consumible'
            : 'material'
        : definition.entityLabel;
const title = `${isEditing ? 'Editar' : 'Registrar'} ${entityLabel}`;
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
        :is-type-fixed="target.action === 'create' && !!target.materialType"
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
