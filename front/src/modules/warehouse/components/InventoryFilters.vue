<script setup lang="ts">
import { ref } from 'vue';
import {
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelTitle,
    VExpansionPanelText,
} from 'vuetify/components/VExpansionPanel';
import { VRow, VCol } from 'vuetify/components/VGrid';
import { VTextField } from 'vuetify/components/VTextField';
import { VBtn } from 'vuetify/components/VBtn';
import RemoteSelect from './RemoteSelect.vue';
import type { LookupItem } from '../inventory.js';

defineProps<{
    supplierId: string;
    canFilterSupplier: boolean;
    isLoading: boolean;
    suppliers: { items: LookupItem[]; isLoading: boolean; error: string; hasMore: boolean };
}>();
const search = defineModel<string>('search', { required: true });
const emit = defineEmits<{
    supplier: [value: string];
    searchOptions: [value: string];
    more: [];
    retry: [];
    apply: [];
    clear: [];
    refresh: [];
}>();
const expanded = ref(0);
</script>

<template>
    <VExpansionPanels
        v-model="expanded"
        class="inventory-filters"
        variant="accordion"
    >
        <VExpansionPanel
            elevation="0"
            rounded="lg"
        >
            <VExpansionPanelTitle>
                <strong>Filtros de búsqueda</strong>
                <span class="filters-hint">
                    {{ search || supplierId ? 'Hay filtros seleccionados' : 'Todos los registros' }}
                </span>
            </VExpansionPanelTitle>
            <VExpansionPanelText>
                <form @submit.prevent="emit('apply')">
                    <VRow density="compact">
                        <VCol
                            cols="12"
                            :md="canFilterSupplier ? 6 : 12"
                        >
                            <VTextField
                                v-model="search"
                                label="Buscar por nombre"
                                clearable
                                @click:clear="
                                    search = '';
                                    emit('apply');
                                "
                            />
                        </VCol>
                        <VCol
                            v-if="canFilterSupplier"
                            cols="12"
                            md="6"
                        >
                            <RemoteSelect
                                label="Filtrar por proveedor"
                                :model-value="supplierId"
                                :items="suppliers.items"
                                :is-loading="suppliers.isLoading"
                                :load-error="suppliers.error"
                                :has-more="suppliers.hasMore"
                                @update:model-value="emit('supplier', $event)"
                                @search="emit('searchOptions', $event)"
                                @more="emit('more')"
                                @retry="emit('retry')"
                            />
                        </VCol>
                    </VRow>
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
                            color="filter-action"
                            variant="flat"
                            :loading="isLoading"
                        >
                            Buscar
                        </VBtn>
                    </div>
                </form>
            </VExpansionPanelText>
        </VExpansionPanel>
    </VExpansionPanels>
</template>

<style scoped>
.inventory-filters {
    margin-bottom: 1rem;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 0.85rem;
    box-shadow: 0 0.2rem 0.65rem rgba(51, 45, 45, 0.04);
}
.inventory-filters :deep(.v-expansion-panel-title) {
    min-height: 52px;
    font-size: 0.9rem;
}
.filters-hint {
    margin-left: auto;
    margin-right: 0.75rem;
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
}
.filter-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.65rem;
    margin-top: 1rem;
}
@media (max-width: 600px) {
    .filters-hint {
        display: none;
    }
    .filter-actions .v-btn {
        flex: 1 1 130px;
    }
}
</style>
