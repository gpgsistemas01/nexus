<script setup lang="ts">
import { computed } from 'vue';
import { getLookupArticle } from '../utils/articleOptions.js';
import { isRecord } from '../utils/isRecord.js';
import { numberText } from '../utils/formatNumbers.js';
import type { LookupItem } from '../lookup.js';

const props = defineProps<{ columns: string[]; selected?: LookupItem }>();
const article = computed(() => getLookupArticle(props.selected));

const mobileReference = computed(() => {
    const data = article.value;
    const unit = isRecord(data.unitMeasure) ? data.unitMeasure : {};
    return [
        data.base != null && data.height != null
            ? `${numberText(Number(data.base))} × ${numberText(Number(data.height))}`
            : '',
        unit.symbol || unit.name || '',
    ]
        .filter(Boolean)
        .join(' · ');
});

const reference = (column: string) => {
    const value = article.value[column];
    if (column === 'base' || column === 'height')
        return numberText(value == null ? null : Number(value));

    if (column === 'unitMeasure' && isRecord(value))
        return String(value.symbol || value.name || '—');

    return '—';
};
</script>

<template>
    <tr
        class="detail-entry"
        aria-label="Agregar detalle"
    >
        <td
            v-for="column in columns"
            :key="column"
            :data-column="column"
            :class="{
                'detail-entry__field': !!$slots[column],
                'v-data-table-column--align-end': column === 'base' || column === 'height',
                'v-data-table-column--fixed': column === 'name',
                'v-data-table-column--fixed-end': column === 'actions',
            }"
        >
            <slot
                :name="column"
                :article="article"
            >
                {{ reference(column) }}
            </slot>
            <small
                v-if="column === 'name' && mobileReference"
                class="detail-entry__mobile-reference"
            >
                {{ mobileReference }}
            </small>
        </td>
    </tr>
</template>

<style scoped>
.detail-entry > td {
    vertical-align: top;
    background: rgb(var(--v-theme-surface));
}
.detail-entry__mobile-reference {
    display: none;
}
@media (min-width: 600px) {
    .detail-entry > td[data-column='costPerUnitType'] {
        min-width: 16rem !important;
    }
    .detail-entry > td[data-column='costScope'] {
        min-width: 18rem !important;
        max-width: 22rem;
    }
}
@media (max-width: 599px) {
    .detail-entry__mobile-reference {
        display: block;
        color: rgb(var(--v-theme-muted));
        margin-block-start: 0.25rem;
        overflow-wrap: anywhere;
    }
    .detail-entry {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.75rem;
        padding: 1rem;
    }
    .detail-entry > td {
        display: none;
    }
    .detail-entry > td.detail-entry__field {
        display: block;
        padding: 0;
        min-width: 0;
        max-width: none;
    }
}
</style>
