const SORT_DIRECTIONS = ['asc', 'desc'];
const isActionColumn = (column = {}) => column.title === 'Acciones';
const appendClassName = (className = '', appendedClassName) => (
    `${ className } ${ appendedClassName }`.trim()
);

export const normalizeColumns = (columns) => {
    if (!Array.isArray(columns)) return columns;

    return columns.map(column => ({
        ...column,
        orderSequence: column.orderSequence || SORT_DIRECTIONS,
        ...(isActionColumn(column) && {
            orderable: false,
            searchable: false,
            className: appendClassName(column.className, 'datatable-action-column')
        })
    }));
};
