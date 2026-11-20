<script setup lang="ts">
import { ref } from 'vue';
import { VCol } from 'vuetify/components/VGrid';
import { VSelect } from 'vuetify/components/VSelect';
import RemoteSelect from '../../../shared/components/RemoteSelect.vue';
import { ARTICLE_TYPE_OPTIONS } from '../catalog.js';
import type { ArticleFilters } from '../catalog.js';
import { useCatalogMeasurementLookups } from '../composables/useCatalogMeasurementLookups.js';

const filters = defineModel<ArticleFilters>({ required: true });
const lookups = useCatalogMeasurementLookups(ref(true), true);
const measurementFilters = [
    { key: 'presentationId', label: 'Filtrar por presentación' },
    { key: 'unitMeasureId', label: 'Filtrar por unidad de medida' },
] as const;

const update = <K extends keyof ArticleFilters>(key: K, value: ArticleFilters[K]) => {
    filters.value = { ...filters.value, [key]: value };
};
</script>

<template>
    <VCol
        cols="12"
        md="6"
    >
        <VSelect
            label="Filtrar por tipo"
            :model-value="filters.type || null"
            :items="ARTICLE_TYPE_OPTIONS"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="update('type', $event ?? '')"
        />
    </VCol>
    <VCol
        v-for="{ key, label } in measurementFilters"
        :key="key"
        cols="12"
        md="6"
    >
        <RemoteSelect
            :label="label"
            :model-value="filters[key]"
            :state="lookups[key].state.value"
            @update:model-value="update(key, $event)"
            @search="lookups[key].updateSearch"
            @more="lookups[key].loadMore"
            @retry="lookups[key].retry"
        />
    </VCol>
</template>
