<script setup lang="ts">
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import { VTable } from 'vuetify/components/VTable';
import { VAlert } from 'vuetify/components/VAlert';
import TableFrame from '../../../shared/components/TableFrame.vue';
import TableAction from '../../../shared/components/TableAction.vue';
import RecordEditorDialog from '../../../shared/components/RecordEditorDialog.vue';
import OrganizationFields from '../../../shared/components/OrganizationFields.vue';
import type { OrganizationState, OrganizationResource } from '../../../shared/lookup.js';
import type { PersonValues } from '../identity.js';

defineProps<{
    title: string;
    values: PersonValues;
    errors: { fullName?: string; accesses?: string };
    departmentId: string;
    roleId: string;
    accessError: string;
    options: OrganizationState;
    message: string;
    isSubmitting: boolean;
    isConflicted: boolean;
    isEditing: boolean;
}>();
const emit = defineEmits<{
    update: [field: 'fullName', value: string];
    blur: [field: 'fullName'];
    draft: [field: 'departmentId' | 'roleId', value: string];
    add: [];
    remove: [departmentId: string];
    search: [resource: OrganizationResource, value: string];
    more: [resource: OrganizationResource];
    retry: [resource: OrganizationResource];
    submit: [];
    close: [];
    reload: [];
}>();
</script>

<template>
    <RecordEditorDialog
        :title="title"
        eyebrow="IDENTIDAD Y ACCESO"
        :max-width="880"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :submit-label="isEditing ? 'Actualizar' : 'Guardar'"
        @close="emit('close')"
        @submit="emit('submit')"
        @reload="emit('reload')"
    >
        <VTextField
            label="Nombre completo"
            name="fullName"
            :model-value="values.fullName"
            :error-messages="errors.fullName"
            :disabled="isSubmitting || isConflicted"
            @update:model-value="emit('update', 'fullName', $event ?? '')"
            @blur="emit('blur', 'fullName')"
        />
        <h3>Responsabilidades por área</h3>
        <p>
            Estas asignaciones describen la participación de la persona; registrar una persona no
            crea una cuenta de usuario.
        </p>
        <OrganizationFields
            :department-id="departmentId"
            :role-id="roleId"
            :options="options"
            :is-disabled="isSubmitting || isConflicted"
            @update="(field, value) => emit('draft', field, value)"
            @search="(resource, value) => emit('search', resource, value)"
            @more="emit('more', $event)"
            @retry="emit('retry', $event)"
        />
        <VBtn
            color="primary"
            variant="outlined"
            :disabled="isSubmitting || isConflicted"
            @click="emit('add')"
        >
            Agregar
        </VBtn>
        <VAlert
            v-if="accessError || errors.accesses"
            type="error"
            role="alert"
            variant="tonal"
        >
            {{ accessError || errors.accesses }}
        </VAlert>
        <TableFrame>
            <VTable
                density="compact"
                aria-label="Responsabilidades de la persona"
            >
                <thead>
                    <tr>
                        <th>Área</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="access in values.accesses"
                        :key="access.departmentId"
                    >
                        <td>{{ access.departmentName }}</td>
                        <td>{{ access.roleName }}</td>
                        <td>
                            <TableAction
                                :label="`Quitar asignación de ${access.departmentName}`"
                                icon="$delete"
                                color="error"
                                :is-disabled="isSubmitting || isConflicted"
                                @click="emit('remove', access.departmentId)"
                            />
                        </td>
                    </tr>
                    <tr v-if="!values.accesses.length">
                        <td colspan="3">Agrega al menos un área y un rol.</td>
                    </tr>
                </tbody>
            </VTable>
        </TableFrame>
    </RecordEditorDialog>
</template>
