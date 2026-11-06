<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import type { CatalogField, CatalogValues } from '../catalog.js';

defineProps<{
    title: string;
    values: CatalogValues;
    errors: Partial<Record<CatalogField, string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
    hasSymbol: boolean;
    maxNameLength: number;
    maxSymbolLength?: number;
    isEditing: boolean;
}>();
const emit = defineEmits<{
    update: [field: CatalogField, value: string | boolean];
    blur: [field: CatalogField];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        eyebrow="CATÁLOGOS"
        :max-width="600"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :message="message"
        reload-label="Cerrar y actualizar catálogo"
        :submit-label="isEditing ? 'Actualizar' : 'Guardar'"
        note="Desactiva un registro para conservar su historial."
        @close="emit('close')"
        @submit="emit('submit')"
        @reload="emit('reload')"
    >
        <VTextField
            label="Nombre"
            name="name"
            :model-value="values.name"
            :maxlength="maxNameLength"
            :error-messages="errors.name"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'name', $event ?? '')"
            @blur="emit('blur', 'name')"
        />
        <VTextField
            v-if="hasSymbol"
            label="Símbolo"
            name="symbol"
            :model-value="values.symbol"
            :maxlength="maxSymbolLength"
            :error-messages="errors.symbol"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'symbol', $event ?? '')"
            @blur="emit('blur', 'symbol')"
        />
        <VCheckbox
            label="Activo"
            :model-value="values.isActive"
            :error-messages="errors.isActive"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'isActive', $event === true)"
        />
    </RecordEditorDialog>
</template>
