<script setup lang="ts">
import RemoteSelect from './RemoteSelect.vue';
import type { OrganizationState, OrganizationResource, LookupItem } from '../lookup.js';

defineProps<{
    departmentId: string;
    roleId: string;
    options: OrganizationState;
    isDisabled: boolean;
    errors?: { departmentId?: string; roleId?: string };
    initialDepartment?: LookupItem;
    initialRole?: LookupItem;
}>();
const emit = defineEmits<{
    update: [field: 'departmentId' | 'roleId', value: string];
    blur: [field: 'departmentId' | 'roleId'];
    search: [resource: OrganizationResource, value: string];
    more: [resource: OrganizationResource];
    retry: [resource: OrganizationResource];
}>();
</script>

<template>
    <div class="organization-fields">
        <RemoteSelect
            label="Área"
            :model-value="departmentId"
            :items="options.departments.items"
            :is-loading="options.departments.isLoading"
            :has-more="options.departments.hasMore"
            :load-error="options.departments.error"
            :error="errors?.departmentId"
            :is-disabled="isDisabled"
            :initial-option="initialDepartment"
            @update:model-value="emit('update', 'departmentId', $event)"
            @blur="emit('blur', 'departmentId')"
            @search="emit('search', 'departments', $event)"
            @more="emit('more', 'departments')"
            @retry="emit('retry', 'departments')"
        />
        <RemoteSelect
            label="Rol"
            :model-value="roleId"
            :items="options.roles.items"
            :is-loading="options.roles.isLoading"
            :has-more="options.roles.hasMore"
            :load-error="options.roles.error"
            :error="errors?.roleId"
            :is-disabled="isDisabled"
            :initial-option="initialRole"
            @update:model-value="emit('update', 'roleId', $event)"
            @blur="emit('blur', 'roleId')"
            @search="emit('search', 'roles', $event)"
            @more="emit('more', 'roles')"
            @retry="emit('retry', 'roles')"
        />
    </div>
</template>

<style scoped>
.organization-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}
@media (max-width: 600px) {
    .organization-fields {
        grid-template-columns: 1fr;
    }
}
</style>
