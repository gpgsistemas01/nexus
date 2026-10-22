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
import FilterActions from '../../../shared/components/FilterActions.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { LookupItem } from '../../../shared/lookup.js';

defineProps<{
    supplierId: string;
    canFilterSupplier: boolean;
    isLoading: boolean;
    suppliers: { items: LookupItem[]; isLoading: boolean; error: string; hasMore: boolean };
}>();
const emit = defineEmits<{
    supplier: [value: string];
    searchOptions: [value: string];
    more: [];
    retry: [];
    apply: [];
    clear: [];
    refresh: [];
}>();
const search = defineModel<string>('search', { required: true });
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
                    <FilterActions
                        :is-loading="isLoading"
                        @refresh="emit('refresh')"
                        @clear="emit('clear')"
                    />
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
.inventory-filters :deep(.filter-actions) {
    margin-top: 1rem;
}
.inventory-filters :deep(.filter-apply) {
    background: linear-gradient(180deg, rgb(var(--v-theme-filter-action)), #163a5c);
    box-shadow: 0 0.35rem 0.75rem rgba(var(--v-theme-filter-action), 0.2);
}
@media (max-width: 600px) {
    .filters-hint {
        display: none;
    }
    .inventory-filters :deep(.filter-actions .v-btn) {
        flex: 1 1 130px;
    }
}
</style>
