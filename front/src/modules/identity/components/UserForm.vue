<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import OrganizationFields from '../../../shared/components/OrganizationFields.vue';
import type { OrganizationState, OrganizationResource } from '../../../shared/lookup.js';
import type { UserValues, UserField, IdentityEntry } from '../identity.js';

defineProps<{
    action: 'create' | 'edit' | 'password';
    title: string;
    values: UserValues;
    errors: Partial<Record<UserField, string>>;
    options: OrganizationState;
    row?: IdentityEntry;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
}>();
const emit = defineEmits<{
    update: [field: UserField, value: string];
    blur: [field: UserField];
    submit: [];
    close: [];
    reload: [];
    search: [resource: OrganizationResource, value: string];
    more: [resource: OrganizationResource];
    retry: [resource: OrganizationResource];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        eyebrow="IDENTIDAD Y ACCESO"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :submit-label="
            action === 'password'
                ? 'Actualizar contraseña'
                : action === 'edit'
                  ? 'Actualizar'
                  : 'Guardar'
        "
        @close="emit('close')"
        @submit="emit('submit')"
        @reload="emit('reload')"
    >
        <VTextField
            label="Usuario"
            name="name"
            autocomplete="off"
            :model-value="values.name"
            :error-messages="errors.name"
            :readonly="action === 'password'"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'name', $event ?? '')"
            @blur="emit('blur', 'name')"
        />
        <VTextField
            v-if="action !== 'edit'"
            label="Contraseña"
            name="password"
            type="password"
            autocomplete="new-password"
            :model-value="values.password"
            :error-messages="errors.password"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'password', $event ?? '')"
            @blur="emit('blur', 'password')"
        />
        <OrganizationFields
            v-if="action !== 'password'"
            :department-id="values.departmentId"
            :role-id="values.roleId"
            :options="options"
            :errors="errors"
            :is-disabled="isSubmitting || isConflicted"
            :initial-department="
                row?.departmentId
                    ? { id: row.departmentId, title: row.departmentName, data: {} }
                    : undefined
            "
            :initial-role="
                row?.roleId ? { id: row.roleId, title: row.roleName, data: {} } : undefined
            "
            @update="(field, value) => emit('update', field, value)"
            @blur="emit('blur', $event)"
            @search="(resource, value) => emit('search', resource, value)"
            @more="emit('more', $event)"
            @retry="emit('retry', $event)"
        />
        <VTextField
            v-if="row && action !== 'password'"
            label="Persona vinculada"
            :model-value="row.personName || 'Sin persona vinculada'"
            readonly
            hint="La edición conserva la vinculación existente."
            persistent-hint
        />
    </RecordEditorDialog>
</template>
