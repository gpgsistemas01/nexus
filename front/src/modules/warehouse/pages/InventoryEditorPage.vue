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
}>();
const emit = defineEmits<{
    saved: [created?: LookupItem];
    close: [];
    reload: [];
    unauthorized: [];
    addStock: [target: StockAdditionTarget];
    createSupplier: [request: LookupCreation];
}>();
const editor = useInventoryEditor({
    ...props,
    onSaved: (created) => emit('saved', created),
    onUnauthorized: () => emit('unauthorized'),
    onAddStock: (target) => emit('addStock', target),
});
const { values, errors, message, isSubmitting, isPending, isConflicted, lookups, preview } = editor;
const sections = computed(() =>
    inventorySections(props.resource, props.target, preview.value, {
        template: editor.selectedTemplate.value,
        usesMeasurements: editor.usesMeasurements.value,
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
        :can-create-supplier="
            canCreateSupplier &&
            target.action === 'create' &&
            resource !== 'wastes' &&
            !initialSupplier &&
            !isPending
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
