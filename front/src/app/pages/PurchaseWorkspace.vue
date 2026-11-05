<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import PurchasePage from '../../modules/purchases/pages/PurchasePage.vue';
import DirectoryCreationPage from './DirectoryCreationPage.vue';
import InventoryEditorPage from '../../modules/warehouse/pages/InventoryEditorPage.vue';
import type { PurchaseResource, ItemCreation } from '../../modules/purchases/purchase.js';
import type { LookupCreation, LookupItem } from '../../shared/lookup.js';

const props = defineProps<{ resource: PurchaseResource }>();
const { session, has, onDenied } = usePageAccess();
const auxiliary = shallowRef<
    ({ kind: 'supplier' } & LookupCreation) | ({ kind: 'item' } & ItemCreation)
>();

const createSupplier = (request: LookupCreation) => {
    if (has(PERMISSIONS.SUPPLIERS_MANAGE) && has(PERMISSIONS.SUPPLIERS_READ))
        auxiliary.value = { kind: 'supplier', ...request };
};

const createItem = (request: ItemCreation) => {
    if (
        has(PERMISSIONS.MATERIALS_WRITE) &&
        has(PERMISSIONS.MATERIALS_READ) &&
        has(PERMISSIONS.PRESENTATIONS_READ) &&
        has(PERMISSIONS.UNIT_MEASURES_READ)
    )
        auxiliary.value = { kind: 'item', ...request };
};

const handleItemSaved = (item?: LookupItem) => {
    if (auxiliary.value?.kind !== 'item' || !item) return;

    auxiliary.value.onCreated(item);
    auxiliary.value = undefined;
};
</script>

<template>
    <PurchasePage
        :resource="resource"
        @create-supplier="createSupplier"
        @create-item="createItem"
    />
    <DirectoryCreationPage
        v-if="auxiliary?.kind === 'supplier'"
        resource="suppliers"
        :request="auxiliary"
        @close="auxiliary = undefined"
    />
    <InventoryEditorPage
        v-if="auxiliary?.kind === 'item'"
        :resource="props.resource"
        :target="{ action: 'create', initialName: auxiliary.search }"
        :user-id="session.user.value!.id"
        creation-context="goodsReceipt"
        :initial-supplier="auxiliary.supplier"
        @saved="handleItemSaved"
        @close="auxiliary = undefined"
        @reload="auxiliary = undefined"
        @unauthorized="onDenied(401)"
    />
</template>
