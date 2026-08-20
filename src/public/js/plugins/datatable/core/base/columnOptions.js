const SORT_DIRECTIONS = ['asc', 'desc'];
const isActionColumn = (column = {}) => column.title === 'Acciones';

export const normalizeColumns = (columns) => {
    if (!Array.isArray(columns)) return columns;

    return columns.map(column => ({
        ...column,
        orderSequence: column.orderSequence || SORT_DIRECTIONS,
        ...(isActionColumn(column) && {
            orderable: false,
            searchable: false
        })
    }));
};
