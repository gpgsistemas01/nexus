<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import IssuePage from '../../modules/issues/pages/IssuePage.vue';
import DirectoryEditorPage from '../../modules/directory/pages/DirectoryEditorPage.vue';
import type { IssueResource } from '../../modules/issues/issue.js';
import type { DirectoryEntry } from '../../modules/directory/directory.js';
import type { LookupItem } from '../../shared/lookup.js';

defineProps<{ resource: IssueResource }>();
const { has, onDenied } = usePageAccess();
const onCreated = shallowRef<(item: LookupItem) => void>();

const createClient = (callback: (item: LookupItem) => void) => {
    if (has(PERMISSIONS.CLIENTS_CREATE) && has(PERMISSIONS.CLIENTS_READ))
        onCreated.value = callback;
};

const handleClientSaved = (entry?: DirectoryEntry) => {
    if (!entry || !onCreated.value) return;

    onCreated.value({
        id: entry.id,
        title: entry.name,
        data: { ...entry },
        isDisabled: !entry.isActive,
    });
    onCreated.value = undefined;
};
</script>

<template>
    <IssuePage
        :resource="resource"
        @create-client="createClient"
    />
    <DirectoryEditorPage
        v-if="onCreated"
        resource="clients"
        :target="{ action: 'create' }"
        @saved="handleClientSaved"
        @close="onCreated = undefined"
        @reload="onCreated = undefined"
        @denied="onDenied"
    />
</template>
