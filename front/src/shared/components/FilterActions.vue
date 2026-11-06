<script setup lang="ts">
import { VBtn } from 'vuetify/components/VBtn';

defineProps<{ isLoading: boolean }>();
const emit = defineEmits<{ refresh: []; clear: [] }>();
</script>

<template>
    <div class="filter-actions">
        <VBtn
            variant="text"
            :disabled="isLoading"
            @click="emit('refresh')"
        >
            Actualizar
        </VBtn>
        <VBtn
            color="filter-clear"
            variant="outlined"
            :disabled="isLoading"
            @click="emit('clear')"
        >
            Limpiar filtros
        </VBtn>
        <VBtn
            type="submit"
            class="filter-apply"
            color="filter-action"
            variant="flat"
            :loading="isLoading"
        >
            Buscar
        </VBtn>
    </div>
</template>

<style scoped>
.filter-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.65rem;
}

@media (max-width: 600px) {
    .filter-actions .v-btn {
        flex: 1 1 120px;
    }
}
</style>
