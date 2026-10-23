<script setup lang="ts">
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { usePurchaseCorrection } from '../composables/usePurchaseCorrection.js';
import PurchaseCorrectionForm from '../components/PurchaseCorrectionForm.vue';
import type { PurchaseResource, PurchaseDetail, PurchaseDocument } from '../purchase.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

const props = defineProps<{
    resource: PurchaseResource;
    document: PurchaseDocument;
    detail: PurchaseDetail;
}>();
const emit = defineEmits<{ saved: [confirmation: MutationConfirmation]; close: []; reload: [] }>();
const { onDenied } = usePageAccess();
const editor = usePurchaseCorrection({
    ...props,
    onSaved: (confirmation) => emit('saved', confirmation),
    onDenied,
});
const { values, errors, message, isSubmitting, isConflicted } = editor;
</script>

<template>
    <PurchaseCorrectionForm
        :context="detail.name"
        :totals="editor.totals.value"
        :values="values"
        :errors="errors"
        :message="message"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        @update="editor.update"
        @blur="editor.blur"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
