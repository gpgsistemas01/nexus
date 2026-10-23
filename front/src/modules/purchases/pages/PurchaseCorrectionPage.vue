<script setup lang="ts">
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { usePurchaseCorrection } from '../composables/usePurchaseCorrection.js';
import PurchaseCorrectionForm from '../components/PurchaseCorrectionForm.vue';
import type { PurchaseResource, PurchaseDetail } from '../purchase.js';

const props = defineProps<{
    resource: PurchaseResource;
    documentId: string;
    detail: PurchaseDetail;
}>();
const emit = defineEmits<{ saved: []; close: []; reload: [] }>();
const { onDenied } = usePageAccess();
const editor = usePurchaseCorrection({ ...props, onSaved: () => emit('saved'), onDenied });
const { values, errors, message, isSubmitting, isConflicted } = editor;
</script>

<template>
    <PurchaseCorrectionForm
        :context="detail.name"
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
