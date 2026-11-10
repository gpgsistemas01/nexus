<script setup lang="ts" generic="Row extends { id: string }">
import { computed, useSlots } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VSelect } from 'vuetify/components/VSelect';
import type { DataTableHeader, DataTableSortItem } from 'vuetify';

const props = withDefaults(
    defineProps<{
        headers: DataTableHeader<Row>[];
        rows: Row[];
        rowClass?: (row: Row) => string;
        formatValue?: (row: Row, key: string) => string;
        sortBy?: DataTableSortItem[];
        sortRows?: boolean;
        sortValue?: (row: Row, key: string) => unknown;
    }>(),
    {
        rowClass: undefined,
        formatValue: undefined,
        sortBy: () => [],
        sortRows: false,
        sortValue: undefined,
    },
);
const emit = defineEmits<{ sortBy: [sortBy: DataTableSortItem[]] }>();
const slots = useSlots();
const sortableColumns = computed(() =>
    props.headers
        .flatMap((header) => (header.children?.length ? header.children : [header]))
        .filter((header) => header.key && header.key !== 'actions' && header.sortable !== false)
        .map((header) => ({ key: String(header.key), title: String(header.title ?? header.key) })),
);
const columns = computed(() =>
    props.headers
        .flatMap((header) => (header.children?.length ? header.children : [header]))
        .filter((header) => header.key && header.key !== 'actions')
        .map((header) => ({ key: String(header.key), title: String(header.title ?? header.key) })),
);
const selectedSortKey = computed(
    () =>
        sortableColumns.value.find((column) => column.key === String(props.sortBy[0]?.key))?.key ??
        sortableColumns.value[0]?.key ??
        '',
);
const sortDirection = computed(() => props.sortBy[0]?.order ?? 'asc');
const displayedRows = computed(() => {
    if (!props.sortRows || !props.sortBy[0]) return props.rows;

    const { key, order } = props.sortBy[0];
    const direction = order === 'desc' ? -1 : 1;

    const valueFor = (row: Row) =>
        props.sortValue
            ? props.sortValue(row, String(key))
            : (row as Record<string, unknown>)[String(key)];

    return [...props.rows].sort((left, right) => {
        const leftValue = valueFor(left);
        const rightValue = valueFor(right);
        const comparison =
            typeof leftValue === 'number' && typeof rightValue === 'number'
                ? leftValue - rightValue
                : String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'es', {
                      numeric: true,
                      sensitivity: 'base',
                  });
        return comparison * direction;
    });
});

const changeSortKey = (key: string | null) => {
    if (key) emit('sortBy', [{ key, order: sortDirection.value }]);
};

const toggleSortDirection = () =>
    emit('sortBy', [
        {
            key: selectedSortKey.value,
            order: sortDirection.value === 'asc' ? 'desc' : 'asc',
        },
    ]);

const cellText = (row: Row, key: string) => {
    if (props.formatValue) return props.formatValue(row, key);

    const value = (row as Record<string, unknown>)[key];
    return value == null || value === '' ? '—' : String(value);
};
</script>

<template>
    <div class="responsive-table-cards">
        <div
            v-if="sortableColumns.length"
            class="responsive-table-cards__sorting"
        >
            <VSelect
                :model-value="selectedSortKey"
                :items="sortableColumns"
                item-title="title"
                item-value="key"
                label="Ordenar por"
                density="compact"
                hide-details
                @update:model-value="changeSortKey"
            />
            <VBtn
                variant="outlined"
                :aria-label="`Cambiar a orden ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`"
                @click="toggleSortDirection"
            >
                {{ sortDirection === 'asc' ? 'Ascendente' : 'Descendente' }}
            </VBtn>
        </div>
        <article
            v-for="row in displayedRows"
            :key="row.id"
            class="responsive-table-card"
            :class="rowClass?.(row)"
        >
            <h3 v-if="columns[0]">
                <slot
                    :name="`item.${columns[0].key}`"
                    :item="row"
                >
                    {{ cellText(row, columns[0].key) }}
                </slot>
            </h3>
            <dl>
                <div
                    v-for="column in columns.slice(1)"
                    :key="column.key"
                >
                    <dt>{{ column.title }}</dt>
                    <dd>
                        <slot
                            :name="`item.${column.key}`"
                            :item="row"
                        >
                            {{ cellText(row, column.key) }}
                        </slot>
                    </dd>
                </div>
            </dl>
            <div
                v-if="slots['item.actions']"
                class="responsive-table-card__actions"
            >
                <slot
                    name="item.actions"
                    :item="row"
                />
            </div>
        </article>
        <p
            v-if="!rows.length"
            class="responsive-table-cards__empty"
        >
            No hay registros para mostrar.
        </p>
    </div>
</template>

<style scoped>
.responsive-table-cards {
    display: none;
}
@media (max-width: 599px) {
    .responsive-table-cards {
        display: grid;
        gap: 0.75rem;
        padding: 0.75rem;
    }
    .responsive-table-cards__sorting {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.5rem;
    }
    .responsive-table-card {
        min-width: 0;
        overflow-wrap: anywhere;
        border: 1px solid rgb(var(--v-theme-table-border));
        border-radius: 0.65rem;
        background: rgb(var(--v-theme-surface));
        padding: 0.85rem;
        box-shadow: 0 0.2rem 0.5rem rgba(var(--v-theme-on-surface), 0.08);
    }
    .responsive-table-card.low-stock {
        border-color: rgb(var(--v-theme-warning));
        background: rgb(var(--v-theme-table-stock-warning));
    }
    .responsive-table-card h3 {
        margin: 0 0 0.65rem;
        border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
        padding-bottom: 0.55rem;
        color: rgb(var(--v-theme-primary));
        font-size: 1.05rem;
        font-weight: 700;
        line-height: 1.35;
    }
    .responsive-table-card dl {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
        gap: 0.6rem 0.75rem;
        margin: 0;
    }
    .responsive-table-card dt {
        width: fit-content;
        border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
        padding-bottom: 0.1rem;
        color: rgb(var(--v-theme-primary));
        font-size: 0.75rem;
        font-weight: 700;
    }
    .responsive-table-card dd {
        margin: 0.12rem 0 0;
        font-size: 0.85rem;
        font-weight: 500;
    }
    .responsive-table-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.7rem;
        border-top: 1px solid rgba(var(--v-theme-table-border), 0.6);
        padding-top: 0.55rem;
    }
    .responsive-table-cards__empty {
        margin: 0;
        padding: 1rem;
        text-align: center;
    }
}
</style>
