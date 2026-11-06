<script setup lang="ts">
import { computed } from 'vue';
import type { DataTableHeader } from 'vuetify';
import { mdiKeyOutline } from '@mdi/js';
import TableAction from '../../../shared/components/TableAction.vue';
import { useTableQuery } from '../../../shared/composables/useTableQuery.js';
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
    ...(props.canEdit ? [{ title: 'Acciones', key: 'actions', sortable: false }] : []),
]);
const { sortBy, changesFromOptions } = useTableQuery(
    () => props.query,
    () => ({ name: 0 }),
);
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
        @options="emit('query', changesFromOptions($event))"
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
            <TableAction
                v-if="canEdit"
                label="Editar registro"
                icon="$edit"
                @click="emit('edit', item)"
            />
            <TableAction
                v-if="canEdit && resource === 'users'"
                label="Cambiar contraseña"
                :icon="`svg:${mdiKeyOutline}`"
                color="accent"
                @click="emit('password', item)"
            />
        </template>
    </ServerTable>
</template>
