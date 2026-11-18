<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import InventoryEditorPage from '../../modules/warehouse/pages/InventoryEditorPage.vue';
import type { ItemCreation } from '../../shared/lookup.js';
import type { LookupItem } from '../../shared/lookup.js';
import InventoryPage from '../../modules/warehouse/pages/InventoryPage.vue';
import DirectoryCreationPage from './DirectoryCreationPage.vue';
import type { InventoryResource } from '../../modules/warehouse/inventory.js';
import type { LookupCreation } from '../../shared/lookup.js';

const props = defineProps<{ resource: InventoryResource }>();
const { has, session, onDenied } = usePageAccess();
const articleCreation = shallowRef<ItemCreation>();

const createArticle = (request: ItemCreation) => {
    if (
        props.resource !== 'wastes' &&
        has(PERMISSIONS.MATERIALS_WRITE) &&
        has(PERMISSIONS.PRESENTATIONS_READ) &&
        has(PERMISSIONS.UNIT_MEASURES_READ)
    )
        articleCreation.value = request;
};

const articleSaved = (item?: LookupItem) => {
    if (!item || !articleCreation.value) return;

    articleCreation.value.onCreated(item);
    articleCreation.value = undefined;
};

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
        @create-article="createArticle"
    />
    <InventoryEditorPage
        v-if="articleCreation && resource !== 'wastes'"
        :resource="resource"
        :target="{ action: 'create', initialName: articleCreation.search }"
        :user-id="session.user.value!.id"
        creation-context="goodsReceipt"
        :initial-supplier="articleCreation.supplier"
        @saved="articleSaved"
        @close="articleCreation = undefined"
        @reload="articleCreation = undefined"
        @unauthorized="onDenied(401)"
    />
    <DirectoryCreationPage
        v-if="creation"
        resource="suppliers"
        :request="creation"
        @close="creation = undefined"
    />
</template>
