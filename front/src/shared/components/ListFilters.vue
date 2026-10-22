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
import FilterActions from './FilterActions.vue';

withDefaults(
    defineProps<{
        isLoading: boolean;
        hasExtraFilters: boolean;
        hasActiveFilters: boolean;
        searchLabel?: string;
    }>(),
    { searchLabel: 'Buscar por nombre' },
);
const emit = defineEmits<{ apply: []; clear: []; refresh: [] }>();
const search = defineModel<string>('search', { required: true });
const expanded = ref(0);
</script>

<template>
    <VExpansionPanels
        v-model="expanded"
        class="list-filters"
        variant="accordion"
    >
        <VExpansionPanel
            elevation="0"
            rounded="lg"
        >
            <VExpansionPanelTitle>
                <strong>Filtros de búsqueda</strong>
                <span class="filters-hint">
                    {{ hasActiveFilters ? 'Hay filtros seleccionados' : 'Todos los registros' }}
                </span>
            </VExpansionPanelTitle>
            <VExpansionPanelText>
                <form
                    novalidate
                    @submit.prevent="emit('apply')"
                >
                    <VRow density="compact">
                        <VCol
                            cols="12"
                            :md="hasExtraFilters ? 6 : 12"
                        >
                            <VTextField
                                v-model="search"
                                :label="searchLabel"
                                clearable
                                @click:clear="
                                    search = '';
                                    emit('apply');
                                "
                            />
                        </VCol>
                        <slot />
                    </VRow>
                    <slot name="messages" />
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
.list-filters {
    margin-bottom: 1rem;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 0.85rem;
    box-shadow: 0 0.2rem 0.65rem rgba(51, 45, 45, 0.04);
}
.list-filters :deep(.v-expansion-panel-title) {
    min-height: 52px;
    font-size: 0.9rem;
}
.filters-hint {
    margin-left: auto;
    margin-right: 0.75rem;
    color: rgb(var(--v-theme-muted));
    font-size: 0.75rem;
}
.list-filters :deep(.filter-actions) {
    margin-top: 1rem;
}
.list-filters :deep(.filter-apply) {
    background: linear-gradient(180deg, rgb(var(--v-theme-filter-action)), #163a5c);
    box-shadow: 0 0.35rem 0.75rem rgba(var(--v-theme-filter-action), 0.2);
}
@media (max-width: 600px) {
    .filters-hint {
        display: none;
    }
    .list-filters :deep(.filter-actions .v-btn) {
        flex: 1 1 130px;
    }
}
</style>
