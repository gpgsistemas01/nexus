<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import InventoryPage from '../../modules/warehouse/pages/InventoryPage.vue';
import DirectoryCreationPage from './DirectoryCreationPage.vue';
import type { InventoryResource } from '../../modules/warehouse/inventory.js';
import type { LookupCreation } from '../../shared/lookup.js';

const props = defineProps<{ resource: InventoryResource }>();
const { has } = usePageAccess();
const creation = shallowRef<LookupCreation>();

const createSupplier = (request: LookupCreation) => {
    if (
        props.resource !== 'wastes' &&
        has(PERMISSIONS.SUPPLIERS_MANAGE) &&
        has(PERMISSIONS.SUPPLIERS_READ)
    )
        creation.value = request;
};
</script>

<template>
    <InventoryPage
        :resource="resource"
        @create-supplier="createSupplier"
    />
    <DirectoryCreationPage
        v-if="creation"
        resource="suppliers"
        :request="creation"
        @close="creation = undefined"
    />
</template>
