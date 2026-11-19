<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import CatalogEditorPage from '../../modules/catalogs/pages/CatalogEditorPage.vue';
import type { CatalogEntry } from '../../modules/catalogs/catalog.js';
import { mapMaterialOption } from '../../shared/utils/articleOptions.js';
import InventoryPage from '../../modules/warehouse/pages/InventoryPage.vue';
import DirectoryCreationPage from './DirectoryCreationPage.vue';
import type { InventoryResource } from '../../modules/warehouse/inventory.js';
import type { LookupCreation } from '../../shared/lookup.js';

const props = defineProps<{ resource: InventoryResource }>();
const { has, onDenied } = usePageAccess();
const articleCreation = shallowRef<LookupCreation>();

const createArticle = (request: LookupCreation) => {
    if (props.resource !== 'wastes' && has(PERMISSIONS.MATERIAL_CATALOGS_MANAGE))
        articleCreation.value = request;
};

const articleSaved = (entry: CatalogEntry) => {
    if (!articleCreation.value) return;

    const option = mapMaterialOption(
        {
            material: {
                ...entry,
                base: entry.base || null,
                height: entry.height || null,
                presentation: { name: entry.presentation },
                unitMeasure: { name: entry.unitMeasure, symbol: entry.unitSymbol },
            },
        },
        props.resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE',
    );
    articleCreation.value.onCreated(option);
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
    <CatalogEditorPage
        v-if="articleCreation && resource !== 'wastes'"
        catalog="materials"
        :target="{
            action: 'create',
            initialName: articleCreation.search,
            materialType: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE',
        }"
        @saved="articleSaved"
        @close="articleCreation = undefined"
        @reload="articleCreation = undefined"
        @denied="onDenied"
    />
    <DirectoryCreationPage
        v-if="creation"
        resource="suppliers"
        :request="creation"
        @close="creation = undefined"
    />
</template>
