<script setup lang="ts">
import { shallowRef } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../composables/usePageAccess.js';
import PurchasePage from '../../modules/purchases/pages/PurchasePage.vue';
import DirectoryEditorPage from '../../modules/directory/pages/DirectoryEditorPage.vue';
import InventoryEditorPage from '../../modules/warehouse/pages/InventoryEditorPage.vue';
import type {
    PurchaseResource,
    CreatedOption,
    ItemCreation,
} from '../../modules/purchases/purchase.js';
import type { DirectoryEntry } from '../../modules/directory/directory.js';
import type { LookupItem } from '../../shared/lookup.js';

const props = defineProps<{ resource: PurchaseResource }>();
const { session, has, onDenied } = usePageAccess();
const auxiliary = shallowRef<
    { kind: 'supplier'; onCreated: CreatedOption } | ({ kind: 'item' } & ItemCreation)
>();

const createSupplier = (onCreated: CreatedOption) => {
    if (has(PERMISSIONS.SUPPLIERS_MANAGE) && has(PERMISSIONS.SUPPLIERS_READ))
        auxiliary.value = { kind: 'supplier', onCreated };
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

const supplierSaved = (entry?: DirectoryEntry) => {
    if (auxiliary.value?.kind !== 'supplier' || !entry) return;

    auxiliary.value.onCreated({
        id: entry.id,
        title: entry.tradeName,
        data: { ...entry },
        isDisabled: !entry.isActive,
    });
    auxiliary.value = undefined;
};

const itemSaved = (item?: LookupItem) => {
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
    <DirectoryEditorPage
        v-if="auxiliary?.kind === 'supplier'"
        resource="suppliers"
        :target="{ action: 'create' }"
        @saved="supplierSaved"
        @close="auxiliary = undefined"
        @reload="auxiliary = undefined"
        @denied="onDenied"
    />
    <InventoryEditorPage
        v-if="auxiliary?.kind === 'item'"
        :resource="props.resource"
        :target="{ action: 'create' }"
        :user-id="session.user.value!.id"
        creation-context="goodsReceipt"
        :initial-supplier="auxiliary.supplier"
        @saved="itemSaved"
        @close="auxiliary = undefined"
        @reload="auxiliary = undefined"
        @unauthorized="onDenied(401)"
    />
</template>
