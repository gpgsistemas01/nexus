<script setup lang="ts">
import TableAction from '../../../shared/components/TableAction.vue';
import type { EditorTarget, InventoryPermissions, InventoryRow } from '../inventory.js';

defineProps<{ row: InventoryRow; permissions: InventoryPermissions; isWaste: boolean }>();
const emit = defineEmits<{ action: [target: EditorTarget] }>();
</script>

<template>
    <div class="inventory-actions">
        <TableAction
            v-if="permissions.canWrite"
            color="filter-action"
            label="Editar"
            icon="$edit"
            @click="emit('action', { action: 'edit', row })"
        />
        <TableAction
            v-if="permissions.canAdjust"
            color="accent"
            label="Ajustar stock"
            icon="$unfold"
            @click="emit('action', { action: 'stock', row })"
        />
        <TableAction
            v-if="permissions.canAdd"
            color="primary"
            label="Agregar stock"
            icon="$plus"
            @click="emit('action', { action: 'add-stock', row })"
        />
        <TableAction
            v-if="!isWaste && permissions.canWrite && row.canDelete"
            color="error"
            label="Eliminar"
            icon="$delete"
            @click="emit('action', { action: 'delete', row })"
        />
    </div>
</template>

<style scoped>
.inventory-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
    min-width: 128px;
    justify-content: center;
}
</style>
