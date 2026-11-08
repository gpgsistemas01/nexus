<script setup lang="ts">
import { useIssueReturn } from '../composables/useIssueReturn.js';
import type { IssueResource, IssueDocument, IssueDetail } from '../issue.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';
import IssueReturnForm from '../components/IssueReturnForm.vue';

const props = defineProps<{
    resource: IssueResource;
    document: IssueDocument;
    detail: IssueDetail;
}>();
const emit = defineEmits<{
    saved: [result: MutationConfirmation];
    close: [];
    denied: [status: number];
}>();
const form = useIssueReturn({
    ...props,
    onSaved: (result) => emit('saved', result),
    onDenied: (status) => emit('denied', status),
});
</script>

<template>
    <IssueReturnForm
        :name="detail.name"
        :presentation="detail.presentation"
        :supplied="detail.suppliedQuantity"
        :returned="detail.returnedQuantity"
        :available="form.availableQuantity"
        :values="form.values"
        :errors="form.errors.value"
        :message="form.message.value"
        :is-submitting="form.isSubmitting.value"
        :is-conflicted="form.isConflicted.value"
        :is-historical="!!document.historicalDelivery"
        :physical-return-confirmed="form.values.physicalReturnConfirmed"
        :physical-return-error="form.errors.value.physicalReturnConfirmed"
        @confirm-physical-return="form.update('physicalReturnConfirmed', $event)"
        @update="form.update"
        @blur="form.blur"
        @submit="form.submit"
        @close="emit('close')"
        @reload="emit('close')"
    />
</template>
