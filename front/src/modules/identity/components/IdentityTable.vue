<script setup lang="ts">
import { computed } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';
import { mdiKeyOutline } from '@mdi/js';
import ServerTable from '../../../shared/components/ServerTable.vue';
import type { IdentityEntry, IdentityResource } from '../identity.js';
import type { IdentityQuery } from '../identity.js';

const props = defineProps<{
    resource: IdentityResource;
    rows: IdentityEntry[];
    total: number;
    query: IdentityQuery;
    isLoading: boolean;
    canEdit: boolean;
}>();
const emit = defineEmits<{
    edit: [row: IdentityEntry];
    password: [row: IdentityEntry];
    query: [changes: Partial<IdentityQuery>];
}>();
const headers = computed<DataTableHeader<IdentityEntry>[]>(() => [
    { title: props.resource === 'persons' ? 'Nombre' : 'Usuario', key: 'name', sortable: true },
    {
        title: props.resource === 'persons' ? 'Accesos (área / rol)' : 'Persona',
        key: props.resource === 'persons' ? 'accesses' : 'personName',
        sortable: false,
    },
    { title: 'Acciones', key: 'actions', sortable: false },
]);
const sortBy = computed(() => [{ key: 'name', order: props.query.direction }]);

const onOptions = (options: { page: number; itemsPerPage: number; sortBy: DataTableSortItem[] }) =>
    emit('query', {
        page: options.page,
        length: options.itemsPerPage,
        orderColumn: 0,
        direction: options.sortBy[0]?.order === 'desc' ? 'desc' : 'asc',
    });
</script>

<template>
    <ServerTable
        :headers="headers"
        :rows="rows"
        :total="total"
        :page="query.page"
        :page-size="query.length"
        :is-loading="isLoading"
        :sort-by="sortBy"
        must-sort
        @options="onOptions"
    >
        <template #[`item.accesses`]="{ item }">
            <p
                v-for="access in item.accesses"
                :key="access.departmentId"
            >
                {{ access.departmentName }} — {{ access.roleName }}
            </p>
        </template>
        <template #[`item.personName`]="{ item }">{{ item.personName || '—' }}</template>
        <template #[`item.actions`]="{ item }">
            <VBtn
                v-if="canEdit"
                aria-label="Editar registro"
                icon="$edit"
                variant="text"
                size="small"
                color="primary"
                @click="emit('edit', item)"
            />
            <VBtn
                v-if="canEdit && resource === 'users'"
                aria-label="Cambiar contraseña"
                :icon="`svg:${mdiKeyOutline}`"
                variant="text"
                size="small"
                color="warning"
                @click="emit('password', item)"
            />
        </template>
    </ServerTable>
</template>
