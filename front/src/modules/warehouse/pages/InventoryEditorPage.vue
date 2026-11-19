<script setup lang="ts">
import { computed } from 'vue';
import InventoryEditor from '../components/InventoryEditor.vue';
import { useInventoryEditor } from '../composables/useInventoryEditor.js';
import { inventorySections } from '../formFields.js';
import { inventoryActionTitle } from '../inventoryDisplay.js';
import type {
    EditorTarget,
    InventoryResource,
    InventoryRow,
    StockAdditionTarget,
} from '../inventory.js';
import type { LookupCreation, LookupItem } from '../../../shared/lookup.js';

const props = defineProps<{
    resource: InventoryResource;
    target: EditorTarget;
    userId: string;
    creationContext?: 'goodsReceipt';
    initialSupplier?: LookupItem;
    canAddStock?: boolean;
    canCreateSupplier?: boolean;
    canCreateArticle?: boolean;
    canEditSupplier?: boolean;
    isOpeningRelatedEditor?: boolean;
    actionError?: string;
}>();
const emit = defineEmits<{
    saved: [created?: LookupItem];
    close: [];
    reload: [];
    unauthorized: [];
    addStock: [target: StockAdditionTarget];
    createSupplier: [request: LookupCreation];
    createArticle: [request: LookupCreation];
    editArticle: [row: InventoryRow];
    editSupplier: [row: InventoryRow];
}>();
const editor = useInventoryEditor({
    resource: props.resource,
    target: props.target,
    userId: props.userId,
    creationContext: props.creationContext,
    initialSupplier: props.initialSupplier,
    canAddStock: props.canAddStock,
    onSaved: (created) => emit('saved', created),
    onUnauthorized: () => emit('unauthorized'),
    onAddStock: (target) => emit('addStock', target),
});
const { values, errors, message, isSubmitting, isPending, isConflicted, lookups, preview } = editor;
const sections = computed(() =>
    inventorySections(props.resource, props.target, preview.value, {
        template: editor.selectedTemplate.value,
        article: editor.selectedArticle.value,
        presentationName: editor.presentationName.value,
        usesMeasurements: editor.usesMeasurements.value,
        isPerPiece: editor.isPerPiece.value,
        hasSupplier: !!values.supplierId,
        creationContext: props.creationContext,
        supplier: props.initialSupplier,
    }),
);
const title = computed(() =>
    inventoryActionTitle(props.resource, props.target.action, props.creationContext),
);
const isEditingOffer = props.target.action === 'edit' && props.resource !== 'wastes';
const context =
    props.target.row && !isEditingOffer
        ? `${props.target.row.name} · ${props.target.row.supplierName} · Stock actual: ${props.target.row.currentStock}`
        : '';

const editArticle = () => {
    if (props.target.action === 'edit' && props.target.row) emit('editArticle', props.target.row);
};

const editSupplier = () => {
    if (props.target.action === 'edit' && props.target.row) emit('editSupplier', props.target.row);
};
</script>

<template>
    <InventoryEditor
        :title="title"
        :context="context"
        :sections="sections"
        :values="values"
        :errors="errors"
        :lookups="lookups"
        :message="message"
        :is-submitting="isSubmitting"
        :is-pending="isPending"
        :is-conflicted="isConflicted"
        :is-confirming-duplicate="editor.isConfirmingDuplicate.value"
        :supplier="editor.selectedSupplier.value"
        :article="editor.selectedArticle.value"
        :can-create-article="
            canCreateArticle &&
            !creationContext &&
            target.action === 'create' &&
            resource !== 'wastes'
        "
        :can-create-supplier="
            canCreateSupplier &&
            target.action === 'create' &&
            resource !== 'wastes' &&
            !initialSupplier &&
            !isPending
        "
        :is-editing-offer="isEditingOffer"
        :can-edit-article="canCreateArticle"
        :can-edit-supplier="canEditSupplier"
        :is-opening-related-editor="isOpeningRelatedEditor"
        :action-error="actionError"
        @create-article="
            emit('createArticle', {
                search: $event,
                onCreated: editor.selectCreatedArticle,
            })
        "
        @create-supplier="
            emit('createSupplier', { search: $event, onCreated: editor.selectCreatedSupplier })
        "
        @update="editor.update"
        @blur="editor.blur"
        @search="editor.searchLookup"
        @more="editor.loadMore"
        @retry="editor.retryLookup"
        @edit-article="editArticle"
        @edit-supplier="editSupplier"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
