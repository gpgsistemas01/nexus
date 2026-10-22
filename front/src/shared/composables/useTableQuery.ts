import { computed } from 'vue';
import type { DataTableSortItem } from 'vuetify';
import type { RecordQuery } from '../list.js';

export interface TableOptions {
    page: number;
    itemsPerPage: number;
    sortBy: DataTableSortItem[];
}

type TableQuery = Pick<RecordQuery, 'direction'> & { orderColumn?: number };

// La tabla traduce opciones visuales; el módulo declara los índices que admite su API.
export const useTableQuery = (
    query: () => TableQuery,
    columns: () => Readonly<Record<string, number>>,
    defaultDirection: 'asc' | 'desc' = 'asc',
) => {
    const firstKey = () => Object.keys(columns())[0] ?? 'name';

    const sortBy = computed<DataTableSortItem[]>(() => [
        {
            key:
                Object.keys(columns()).find(
                    (key) => columns()[key] === (query().orderColumn ?? 0),
                ) ?? firstKey(),
            order: query().direction,
        },
    ]);

    const changesFromOptions = (options: TableOptions): Omit<RecordQuery, 'search'> => ({
        page: options.page,
        length: options.itemsPerPage,
        orderColumn: columns()[String(options.sortBy[0]?.key)] ?? columns()[firstKey()] ?? 0,
        direction:
            options.sortBy[0]?.order === 'desc'
                ? 'desc'
                : options.sortBy[0]?.order === 'asc'
                  ? 'asc'
                  : defaultDirection,
    });

    return { sortBy, changesFromOptions };
};
