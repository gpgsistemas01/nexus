<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import IssuePage from '../../modules/issues/pages/IssuePage.vue';
import DirectoryCreationPage from './DirectoryCreationPage.vue';
import type { IssueResource } from '../../modules/issues/issue.js';
import type { LookupCreation } from '../../shared/lookup.js';

defineProps<{ resource: IssueResource }>();
const { has } = usePageAccess();
const creation = shallowRef<LookupCreation>();

const createClient = (request: LookupCreation) => {
    if (has(PERMISSIONS.CLIENTS_CREATE) && has(PERMISSIONS.CLIENTS_READ)) creation.value = request;
};
</script>

<template>
    <IssuePage
        :resource="resource"
        @create-client="createClient"
    />
    <DirectoryCreationPage
        v-if="creation"
        resource="clients"
        :request="creation"
        @close="creation = undefined"
    />
</template>
