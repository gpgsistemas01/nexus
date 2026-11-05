<script setup lang="ts">
import { computed } from 'vue';
import { usePageAccess } from '../composables/usePageAccess.js';
import DirectoryEditorPage from '../../modules/directory/pages/DirectoryEditorPage.vue';
import { DIRECTORY_CONFIG } from '../../modules/directory/directory.js';
import type { DirectoryResource, DirectoryEntry } from '../../modules/directory/directory.js';
import type { LookupCreation } from '../../shared/lookup.js';

const props = defineProps<{ resource: DirectoryResource; request: LookupCreation }>();
const emit = defineEmits<{ close: [] }>();
const { has, onDenied } = usePageAccess();
const canCreate = computed(
    () =>
        has(DIRECTORY_CONFIG[props.resource].create) && has(DIRECTORY_CONFIG[props.resource].read),
);

const saved = (entry?: DirectoryEntry) => {
    if (!entry || !canCreate.value) return;

    props.request.onCreated({
        id: entry.id,
        title: props.resource === 'clients' ? entry.name : entry.tradeName,
        data: { ...entry },
        isDisabled: !entry.isActive,
    });
    emit('close');
};
</script>

<template>
    <DirectoryEditorPage
        v-if="canCreate"
        :resource="resource"
        :target="{ action: 'create', initialName: request.search }"
        @saved="saved"
        @close="emit('close')"
        @reload="emit('close')"
        @denied="onDenied"
    />
</template>
