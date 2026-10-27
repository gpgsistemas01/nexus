<script setup lang="ts">
import { VCol } from 'vuetify/components/VGrid';
import { computed } from 'vue';
import { VTextField } from 'vuetify/components/VTextField';
import { VAlert } from 'vuetify/components/VAlert';
import ListFilters from '../../../shared/components/ListFilters.vue';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import type { IssueFilters, IssueFilterSelect } from '../issue.js';

const props = defineProps<{
    values: IssueFilters;
    selects: IssueFilterSelect[];
    isLoading: boolean;
    isDepartmentLocked: boolean;
    error: string;
}>();
const emit = defineEmits<{
    update: [field: keyof IssueFilters, value: string];
    apply: [];
    clear: [];
    refresh: [];
    searchOptions: [kind: IssueFilterSelect['kind'], value: string];
    more: [kind: IssueFilterSelect['kind']];
    retry: [kind: IssueFilterSelect['kind']];
}>();
const search = defineModel<string>('search', { required: true });
const hasActiveFilters = computed(
    () =>
        !!search.value ||
        Object.entries(props.values).some(
            ([field, value]) => !!value && !(field === 'departmentId' && props.isDepartmentLocked),
        ),
);
</script>

<template>
    <ListFilters
        v-model:search="search"
        :is-loading="isLoading"
        has-extra-filters
        :has-active-filters="hasActiveFilters"
        search-label="Buscar por Folio o Proyecto"
        @apply="emit('apply')"
        @clear="emit('clear')"
        @refresh="emit('refresh')"
    >
        <VCol
            v-for="select in selects"
            :key="select.field"
            cols="12"
            md="6"
            lg="3"
        >
            <RemoteSelect
                :label="select.label"
                :model-value="values[select.field]"
                :items="select.state.items"
                :is-loading="select.state.isLoading"
                :has-more="select.state.hasMore"
                :load-error="select.state.error"
                :is-disabled="select.isDisabled"
                :hint="select.hint"
                @update:model-value="emit('update', select.field, $event)"
                @search="emit('searchOptions', select.kind, $event)"
                @more="emit('more', select.kind)"
                @retry="emit('retry', select.kind)"
            />
        </VCol>
        <VCol
            cols="12"
            md="6"
        >
            <VTextField
                label="Fecha de inicio"
                type="date"
                :model-value="values.startDate"
                :max="values.endDate || undefined"
                @update:model-value="emit('update', 'startDate', $event ?? '')"
            />
        </VCol>
        <VCol
            cols="12"
            md="6"
        >
            <VTextField
                label="Fecha de fin"
                type="date"
                :model-value="values.endDate"
                :min="values.startDate || undefined"
                @update:model-value="emit('update', 'endDate', $event ?? '')"
            />
        </VCol>
        <VCol cols="12">
            <VTextField
                label="Observaciones contiene:"
                type="search"
                :model-value="values.observationsSearch"
                @update:model-value="emit('update', 'observationsSearch', $event ?? '')"
            />
        </VCol>
        <template #messages>
            <VAlert
                v-if="error"
                type="error"
                role="alert"
                class="mt-3"
            >
                {{ error }}
            </VAlert>
        </template>
    </ListFilters>
</template>
