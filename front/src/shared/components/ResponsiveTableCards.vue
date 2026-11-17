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
        emptyText?: string;
    }>(),
    {
        rowClass: undefined,
        formatValue: undefined,
        sortBy: () => [],
        sortRows: false,
        sortValue: undefined,
        emptyText: 'No hay registros para mostrar.',
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
        .flatMap((header) =>
            header.children?.length
                ? header.children.map((child) => ({
                      ...child,
                      groupTitle: String(header.title ?? ''),
                  }))
                : [header],
        )
        .filter((header) => header.key && header.key !== 'actions')
        .map((header) => ({
            key: String(header.key),
            title: String(header.title ?? header.key),
            groupTitle: 'groupTitle' in header ? header.groupTitle : '',
        })),
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
                <span class="responsive-table-card__title-label">
                    {{ columns[0].title }}
                </span>
                <span class="responsive-table-card__title-value">
                    <slot
                        :name="`item.${columns[0].key}`"
                        :item="row"
                    >
                        {{ cellText(row, columns[0].key) }}
                    </slot>
                </span>
            </h3>
            <dl>
                <div
                    v-for="column in columns.slice(1)"
                    :key="column.key"
                    class="responsive-table-card__field"
                    :class="{ 'responsive-table-card__field--subcolumn': column.groupTitle }"
                >
                    <dt>
                        <span
                            v-if="column.groupTitle"
                            class="responsive-table-card__group"
                        >
                            {{ column.groupTitle }}
                        </span>
                        <span>{{ column.title }}</span>
                    </dt>
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
            {{ emptyText }}
        </p>
    </div>
</template>

<style scoped>
.responsive-table-cards {
    display: none;
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
    container-type: inline-size;
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
    display: grid;
    min-width: 0;
    gap: 0.15rem;
    margin: 0 0 0.65rem;
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
    padding-bottom: 0.55rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
    text-wrap: wrap;
}
.responsive-table-card__title-label {
    min-width: 0;
    color: rgb(var(--v-theme-muted));
    font-size: clamp(0.68rem, calc(0.68rem + 0.15cqi), 0.78rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    overflow-wrap: anywhere;
}
.responsive-table-card__title-value {
    min-width: 0;
    color: rgb(var(--v-theme-primary));
    font-size: clamp(0.9rem, calc(0.9rem + 0.15cqi), 1.05rem);
    font-weight: 700;
    overflow-wrap: anywhere;
}
.responsive-table-card dl {
    margin: 0;
}
.responsive-table-card__field {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(var(--v-theme-table-border), 0.35);
    padding: 0.45rem 0.35rem;
    overflow-wrap: anywhere;
}
.responsive-table-card__field:nth-child(even) {
    background: rgba(var(--v-theme-table-alt), 0.45);
}
.responsive-table-card__field--subcolumn {
    border-left: 3px solid rgb(var(--v-theme-table-child-border));
    border-radius: 0.25rem;
    background: rgb(var(--v-theme-table-child-header));
}
.responsive-table-card__field--subcolumn:nth-child(even) {
    background: rgb(var(--v-theme-table-child-header));
}
.responsive-table-card__group {
    display: block;
    margin-bottom: 0.15rem;
    color: rgb(var(--v-theme-table-child-text));
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.responsive-table-card dt {
    min-width: 0;
    color: rgb(var(--v-theme-muted));
    font-size: clamp(0.68rem, calc(0.68rem + 0.15cqi), 0.78rem);
    font-weight: 600;
    overflow-wrap: anywhere;
}
.responsive-table-card dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
    font-size: clamp(0.78rem, calc(0.78rem + 0.15cqi), 0.9rem);
    font-weight: 600;
    text-align: right;
}
.responsive-table-card__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
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
@media (max-width: 599px) {
    .responsive-table-cards {
        display: grid;
    }
}
</style>
