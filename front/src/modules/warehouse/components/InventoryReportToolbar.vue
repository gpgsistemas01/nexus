<script setup lang="ts">
import { VAlert } from 'vuetify/components/VAlert';
import { VBtn } from 'vuetify/components/VBtn';
import { VSelect } from 'vuetify/components/VSelect';

defineProps<{ scope: string; hasSupplierFilter: boolean; isExporting: boolean; error: string }>();
const emit = defineEmits<{ 'update:scope': [scope: string]; export: [] }>();
const scopes = [
    { title: 'Activos o con stock', value: 'activeOrStock' },
    { title: 'Activos', value: 'active' },
    { title: 'Con stock', value: 'inStock' },
];
</script>

<template>
    <div>
        <VAlert
            v-if="error"
            role="alert"
            aria-label="Error de descarga"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
        >
            {{ error }}
            <VBtn
                variant="text"
                :loading="isExporting"
                @click="emit('export')"
            >
                Reintentar descarga
            </VBtn>
        </VAlert>
        <div class="inventory-export">
            <span
                v-if="hasSupplierFilter"
                class="report-note"
            >
                El Excel incluye todos los proveedores del tipo seleccionado.
            </span>
            <VSelect
                :model-value="scope"
                label="Incluir en Excel"
                :items="scopes"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="emit('update:scope', $event)"
            />
            <VBtn
                variant="text"
                color="primary"
                :loading="isExporting"
                @click="emit('export')"
            >
                Descargar Excel
            </VBtn>
        </div>
    </div>
</template>

<style scoped>
.inventory-export {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}
.inventory-export :deep(.v-input) {
    max-width: 230px;
}
.report-note {
    color: #64796c;
    font-size: 0.75rem;
}
@media (max-width: 700px) {
    .inventory-export {
        flex-wrap: wrap;
        justify-content: flex-start;
    }
}
</style>
