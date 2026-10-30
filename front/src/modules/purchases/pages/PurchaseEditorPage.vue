<script setup lang="ts">
import { computed } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { usePageAccess } from '../../../app/composables/usePageAccess.js';
import { usePurchaseEditor } from '../composables/usePurchaseEditor.js';
import PurchaseEditor from '../components/PurchaseEditor.vue';
import PurchaseLineEntryPage from './PurchaseLineEntryPage.vue';
import { canEditPurchase } from '../purchaseRules.js';
import type {
    PurchaseResource,
    PurchaseTarget,
    PurchaseDetail,
    ItemCreation,
} from '../purchase.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';
import type { LookupCreation } from '../../../shared/lookup.js';

const props = defineProps<{
    resource: PurchaseResource;
    target: PurchaseTarget;
    canChangeDetails: boolean;
    isChanging: boolean;
    readError: string;
}>();
const emit = defineEmits<{
    saved: [confirmation: MutationConfirmation];
    close: [];
    reload: [];
    correct: [detail: PurchaseDetail];
    cancel: [detail: PurchaseDetail];
    createSupplier: [request: LookupCreation];
    createItem: [request: ItemCreation];
}>();
const { has, onDenied } = usePageAccess();
const editor = usePurchaseEditor({
    resource: props.resource,
    target: props.target,
    has,
    onSaved: (confirmation) => emit('saved', confirmation),
    onDenied,
});
const {
    values,
    errors,
    message,
    isSubmitting,
    isConflicted,
    supplier,
    receiverSeed,
    suppliers,
    persons,
    totals,
} = editor;
const document = props.target.action === 'create' ? undefined : props.target.document;
const details = computed(() => [...(document?.details ?? []), ...values.details]);
const canReadItems = computed(() => has(PERMISSIONS.MATERIALS_READ));
const canCreateItem = computed(
    () =>
        canReadItems.value &&
        has(PERMISSIONS.MATERIALS_WRITE) &&
        has(PERMISSIONS.PRESENTATIONS_READ) &&
        has(PERMISSIONS.UNIT_MEASURES_READ),
);
const title = document
    ? `${props.target.action === 'edit' ? 'Editar' : 'Ver'} compra - Folio ${document.referenceNumber}`
    : 'Registrar compra';
</script>

<template>
    <PurchaseEditor
        :title="title"
        :values="values"
        :errors="errors"
        :message="message || readError"
        :is-submitting="isSubmitting"
        :is-conflicted="isConflicted"
        :is-read-only="editor.isReadOnly"
        :is-changing="isChanging"
        :is-editing="target.action === 'edit'"
        :suppliers="suppliers.state.value"
        :persons="persons.state.value"
        :can-suppliers="editor.canSuppliers.value"
        :can-persons="editor.canPersons.value"
        :supplier="supplier"
        :receiver="receiverSeed"
        :details="details"
        :totals="totals"
        :can-change-details="
            canChangeDetails && target.action === 'view' && !!document && canEditPurchase(document)
        "
        :can-create-supplier="has(PERMISSIONS.SUPPLIERS_MANAGE) && editor.canSuppliers.value"
        @update="editor.update"
        @blur="editor.blur"
        @search="(kind, value) => editor[kind].updateSearch(value)"
        @more="editor[$event].loadMore()"
        @retry="editor[$event].retry()"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
        @remove="editor.removeDetail"
        @correct="emit('correct', $event)"
        @cancel="emit('cancel', $event)"
        @create-supplier="
            emit('createSupplier', { search: $event, onCreated: editor.selectCreatedSupplier })
        "
    >
        <template #entry>
            <PurchaseLineEntryPage
                v-if="supplier && !editor.isReadOnly"
                :key="supplier.id"
                :resource="resource"
                :supplier="supplier"
                :is-disabled="isSubmitting"
                :can-read="canReadItems"
                :can-create="canCreateItem"
                @add="editor.addDetail"
                @create="emit('createItem', $event)"
            />
        </template>
    </PurchaseEditor>
</template>
