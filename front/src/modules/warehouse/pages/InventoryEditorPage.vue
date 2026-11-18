<script setup lang="ts">
import { computed } from 'vue';
import InventoryEditor from '../components/InventoryEditor.vue';
import { useInventoryEditor } from '../composables/useInventoryEditor.js';
import { inventorySections } from '../formFields.js';
import { INVENTORY_CONFIG } from '../inventory.js';
import type { EditorTarget, InventoryResource, StockAdditionTarget } from '../inventory.js';
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
}>();
const emit = defineEmits<{
    saved: [created?: LookupItem];
    close: [];
    reload: [];
    unauthorized: [];
    addStock: [target: StockAdditionTarget];
    createSupplier: [request: LookupCreation];
    createArticle: [request: LookupCreation];
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
        presentationName: editor.presentationName.value,
        usesMeasurements: editor.usesMeasurements.value,
        isPerPiece: editor.isPerPiece.value,
        hasSupplier: !!values.supplierId,
        creationContext: props.creationContext,
        supplier: props.initialSupplier,
    }),
);
const title = computed(
    () =>
        `${{ create: 'Crear', edit: 'Editar', stock: 'Ajustar stock de', 'add-stock': 'Agregar stock de', delete: 'Eliminar' }[props.target.action]} ${INVENTORY_CONFIG[props.resource].singular}`,
);
const context = props.target.row
    ? `${props.target.row.name} · ${props.target.row.supplierName} · Stock actual: ${props.target.row.currentStock}`
    : '';
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
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
