const DEFAULT_PAGE_LENGTH = 10;
const ORDER_DIRECTIONS = new Set(['asc', 'desc']);

const parseInteger = (value, fallback) => {

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? fallback : parsed;
};

export const getDataTablePaging = (query = {}) => ({
    skip: Math.max(parseInteger(query.start, 0), 0),
    take: Math.max(parseInteger(query.length, DEFAULT_PAGE_LENGTH), 0)
});

export const getDataTableSearch = (query = {}) => {

    if (typeof query.search === 'string') return query.search;

    if (typeof query.search?.value === 'string') return query.search.value;

    if (typeof query['search[value]'] === 'string') return query['search[value]'];

    return '';
};

export const getDataTableOrder = ({
    query = {},
    columns = [],
    defaultDirection = 'asc'
} = {}) => {

    const order = Array.isArray(query.order)
        ? query.order[0]
        : query.order?.[0];

    const columnIndex = parseInteger(
        order?.column ?? query['order[0][column]'],
        0
    );

    const rawDirection = order?.dir ?? query['order[0][dir]'] ?? defaultDirection;
    const orderDir = ORDER_DIRECTIONS.has(rawDirection) ? rawDirection : defaultDirection;

    return {
        orderBy: columns[columnIndex] || columns[0],
        orderDir
    };
};
