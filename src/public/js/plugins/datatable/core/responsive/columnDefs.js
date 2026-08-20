import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';

const MAIN_TABLE_DEFAULT_COLUMN_DEFS = [
    { targets: 0, responsivePriority: 1 },
    { targets: -1, responsivePriority: 2 },
    { targets: 1, responsivePriority: 3 }
];

export const mergeMainTableColumnDefs = (selector, columnDefs = []) => {
    if (selector !== DATATABLE_SELECTORS.MAIN) return columnDefs;

    return [
        ...MAIN_TABLE_DEFAULT_COLUMN_DEFS,
        ...(Array.isArray(columnDefs) ? columnDefs : [])
    ];
};
