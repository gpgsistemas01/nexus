<script setup lang="ts">
import { computed } from 'vue';
import InventoryEditor from '../components/InventoryEditor.vue';
import { useInventoryEditor } from '../composables/useInventoryEditor.js';
import { inventoryFields } from '../formFields.js';
import { INVENTORY_CONFIG } from '../inventory.js';
import type { EditorTarget, InventoryResource } from '../inventory.js';

const props = defineProps<{ resource: InventoryResource; target: EditorTarget; userId: string }>();
const emit = defineEmits<{ saved: []; close: []; reload: []; unauthorized: [] }>();
const editor = useInventoryEditor({
    ...props,
    onSaved: () => emit('saved'),
    onUnauthorized: () => emit('unauthorized'),
});
const { values, errors, message, isSubmitting, isPending, isConflicted, lookups, preview } = editor;
const fields = computed(() => inventoryFields(props.resource, props.target, preview.value));
const title = computed(
    () =>
        `${{ create: 'Crear', edit: 'Editar', stock: 'Ajustar stock de', 'add-stock': 'Agregar stock de', delete: 'Eliminar' }[props.target.action]} ${INVENTORY_CONFIG[props.resource].singular}`,
);
const context = props.target.row
    ? `${props.target.row.name} · ${props.target.row.supplierName} · Stock actual: ${props.target.row.currentStock}`
    : '';
const searchLookup = (field: string, search: string) => {
    if (['supplierId', 'presentationId', 'unitMeasureId', 'materialId', 'reasonId'].includes(field))
        editor.searchLookup(field as Parameters<typeof editor.searchLookup>[0], search);
};
const retryLookup = (field: string) => {
    if (['supplierId', 'presentationId', 'unitMeasureId', 'materialId', 'reasonId'].includes(field))
        void editor.retryLookup(field as Parameters<typeof editor.retryLookup>[0]);
};
const loadMore = (field: string) => {
    if (['supplierId', 'presentationId', 'unitMeasureId', 'materialId', 'reasonId'].includes(field))
        void editor.loadMore(field as Parameters<typeof editor.loadMore>[0]);
};
</script>

<template>
    <InventoryEditor
        :title="title"
        :context="context"
        :fields="fields"
        :values="values"
        :errors="errors"
        :lookups="lookups"
        :message="message"
        :is-submitting="isSubmitting"
        :is-pending="isPending"
        :is-conflicted="isConflicted"
        :is-delete="target.action === 'delete'"
        :weight-preview="
            resource === 'wastes' && target.action === 'create' ? preview.weightKg : null
        "
        @update="editor.update"
        @blur="editor.blur"
        @search="searchLookup"
        @more="loadMore"
        @retry="retryLookup"
        @submit="editor.submit"
        @close="emit('close')"
        @reload="emit('reload')"
    />
</template>
