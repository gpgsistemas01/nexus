<script setup lang="ts">
import HistoricalDeliveryDialog from '../components/HistoricalDeliveryDialog.vue';
import { useHistoricalDelivery } from '../composables/useHistoricalDelivery.js';
import type { IssueResource } from '../issue.js';

const props = defineProps<{ resource: IssueResource; userId: string }>();
const emit = defineEmits<{ close: []; saved: []; unauthorized: [] }>();
const state = useHistoricalDelivery({
    ...props,
    onSaved: () => emit('saved'),
    onUnauthorized: () => emit('unauthorized'),
});
const {
    values,
    preview,
    receipt,
    selected,
    allSelected,
    isWorking,
    isSelectingAll,
    error,
    recoveryRequired,
    canConfirm,
} = state;
</script>

<template>
    <HistoricalDeliveryDialog
        :values="values"
        :preview="preview"
        :receipt="receipt"
        :selected="selected"
        :all-selected="allSelected"
        :is-working="isWorking"
        :is-selecting-all="isSelectingAll"
        :error="error"
        :recovery-required="recoveryRequired"
        :can-confirm="canConfirm"
        @update="(field, value) => (values[field] = value)"
        @declare="values.declaredDelivered = $event"
        @select="state.toggle"
        @select-all="state.selectAll"
        @load="state.load"
        @confirm="state.confirm"
        @recover="state.recover"
        @close="emit('close')"
    />
</template>
