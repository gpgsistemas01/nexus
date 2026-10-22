<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import { VCheckbox } from 'vuetify/components/VCheckbox';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import type { DirectoryValues, DirectoryField, DirectoryResource } from '../directory.js';

defineProps<{
    resource: DirectoryResource;
    title: string;
    values: DirectoryValues;
    errors: Partial<Record<DirectoryField, string>>;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
    isEditing: boolean;
}>();
const emit = defineEmits<{
    update: [field: DirectoryField, value: string | boolean];
    blur: [field: DirectoryField];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        eyebrow="DIRECTORIO COMERCIAL"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :submit-label="isEditing ? 'Actualizar' : 'Guardar'"
        @close="emit('close')"
        @submit="emit('submit')"
        @reload="emit('reload')"
    >
        <VTextField
            v-if="resource === 'clients'"
            label="Nombre"
            name="name"
            :model-value="values.name"
            :error-messages="errors.name"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'name', $event ?? '')"
            @blur="emit('blur', 'name')"
        />
        <template v-else>
            <VTextField
                label="Razón social"
                name="legalName"
                :model-value="values.legalName"
                :error-messages="errors.legalName"
                :disabled="isSubmitting || isConflicted"
                @update:model-value="emit('update', 'legalName', $event ?? '')"
                @blur="emit('blur', 'legalName')"
            />
            <VTextField
                label="Nombre comercial"
                name="tradeName"
                :model-value="values.tradeName"
                :error-messages="errors.tradeName"
                :disabled="isSubmitting || isConflicted"
                @update:model-value="emit('update', 'tradeName', $event ?? '')"
                @blur="emit('blur', 'tradeName')"
            />
        </template>
        <VCheckbox
            label="Activo"
            :model-value="values.isActive"
            :error-messages="errors.isActive"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'isActive', $event === true)"
        />
    </RecordEditorDialog>
</template>
