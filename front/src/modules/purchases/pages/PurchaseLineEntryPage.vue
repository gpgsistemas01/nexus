<script setup lang="ts">
import { usePurchaseLineEntry } from '../composables/usePurchaseLineEntry.js';
import { PURCHASE_CONFIG } from '../purchaseConfig.js';
import { getLookupPresentation } from '../../../shared/utils/getLookupPresentation.js';
import type { PurchaseResource, PurchaseDetail } from '../purchase.js';
import type { ItemCreation } from '../../../shared/lookup.js';
import type { LookupItem } from '../../../shared/lookup.js';
import PurchaseLineEntryForm from '../components/PurchaseLineEntryForm.vue';

const props = defineProps<{
    resource: PurchaseResource;
    supplier: LookupItem;
    isDisabled: boolean;
    canRead: boolean;
    canCreate: boolean;
}>();
const emit = defineEmits<{ add: [line: PurchaseDetail]; create: [request: ItemCreation] }>();
const line = usePurchaseLineEntry({
    resource: props.resource,
    canRead: props.canRead,
    isDisabled: () => props.isDisabled,
    onAdded: (value) => emit('add', value),
});
const { values, errors, items, item } = line;
</script>

<template>
    <PurchaseLineEntryForm
        :item-label="PURCHASE_CONFIG[resource].item"
        :values="values"
        :errors="errors"
        :items="items.state.value"
        :selected="item"
        :presentation="getLookupPresentation(item)"
        :cost-is-total="line.costIsTotal.value"
        :automatic-total-cost="line.automaticTotalCost.value"
        :is-disabled="isDisabled"
        :can-read="canRead"
        :can-create="canCreate"
        @update:cost-is-total="line.costIsTotal.value = $event"
        @update="line.update"
        @blur="line.blur"
        @search="items.updateSearch"
        @more="items.loadMore"
        @retry="items.retry"
        @add="line.add"
        @create="emit('create', { supplier, search: $event, onCreated: line.selectCreatedItem })"
    />
</template>
