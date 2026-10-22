<script setup lang="ts">
import { VTooltip } from 'vuetify/components/VTooltip';
import { VBtn } from 'vuetify/components/VBtn';
import { VIcon } from 'vuetify/components/VIcon';
import type { EditorTarget, InventoryPermissions, InventoryRow } from '../inventory.js';

defineProps<{ row: InventoryRow; permissions: InventoryPermissions; isWaste: boolean }>();
const emit = defineEmits<{ action: [target: EditorTarget] }>();
</script>

<template>
    <div class="inventory-actions">
        <VBtn
            v-if="permissions.canWrite"
            color="filter-action"
            size="x-small"
            icon
            aria-label="Editar"
            variant="flat"
            @click="emit('action', { action: 'edit', row })"
        >
            <VIcon icon="$edit" />
            <VTooltip activator="parent">Editar</VTooltip>
        </VBtn>
        <VBtn
            v-if="permissions.canAdjust"
            color="accent"
            size="x-small"
            icon
            aria-label="Ajustar stock"
            variant="flat"
            @click="emit('action', { action: 'stock', row })"
        >
            <VIcon icon="$unfold" />
            <VTooltip activator="parent">Ajustar stock</VTooltip>
        </VBtn>
        <VBtn
            v-if="permissions.canAdd"
            color="primary"
            size="x-small"
            icon
            aria-label="Agregar stock"
            variant="flat"
            @click="emit('action', { action: 'add-stock', row })"
        >
            <VIcon icon="$plus" />
            <VTooltip activator="parent">Agregar stock</VTooltip>
        </VBtn>
        <VBtn
            v-if="!isWaste && permissions.canWrite && row.canDelete"
            color="error"
            size="x-small"
            icon
            aria-label="Eliminar"
            variant="flat"
            @click="emit('action', { action: 'delete', row })"
        >
            <VIcon icon="$delete" />
            <VTooltip activator="parent">Eliminar</VTooltip>
        </VBtn>
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
.inventory-actions :deep(.v-btn) {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 0.2rem 0.45rem rgba(var(--v-theme-on-surface), 0.16);
}
</style>
