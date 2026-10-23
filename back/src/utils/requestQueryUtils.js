import { DATA_TABLE_PAGING } from '../constants/pagination.js';

const ORDER_DIRECTIONS = new Set(['asc', 'desc']);

const parseInteger = (value, fallback) => {

    if (typeof value !== 'string' && typeof value !== 'number') return fallback;

    if (typeof value === 'string' && !/^-?\d+$/.test(value.trim())) return fallback;

    const parsed = Number(value);

    return Number.isSafeInteger(parsed) ? parsed : fallback;
};

const getFirstOrder = (query = {}) => {

    if (Array.isArray(query.order)) return query.order[0] || {};

    if (query.order?.[0]) return query.order[0];

    return {};
};

const resolveFallbackColumn = (columns = []) => columns.find(Boolean);

export const getDataTablePaging = (query = {}) => {
    const start = parseInteger(query.start, 0);
    const length = parseInteger(query.length, DATA_TABLE_PAGING.DEFAULT_LENGTH);

    return {
        skip: start >= 0 && start <= DATA_TABLE_PAGING.MAX_START ? start : 0,
        take: Math.min(Math.max(length, 0), DATA_TABLE_PAGING.MAX_LENGTH)
    };
};

export const getDataTableSearch = (query = {}) => {

    if (typeof query.search === 'string') return query.search;

    if (typeof query.search?.value === 'string') return query.search.value;

    if (typeof query['search[value]'] === 'string') return query['search[value]'];

    return '';
};

export const isMonthlyReportQuery = (query = {}) => (
    query.monthlyReport === true || query.monthlyReport === 'true'
);

export const getDataTableOrder = ({
    query = {},
    columns = [],
    defaultDirection = 'asc'
} = {}) => {

    const order = getFirstOrder(query);
    const fallbackColumn = resolveFallbackColumn(columns);

    const columnIndex = parseInteger(
        order?.column ?? query['order[0][column]'],
        0
    );

    const rawDirection = String(order?.dir ?? query['order[0][dir]'] ?? defaultDirection).toLowerCase();
    const normalizedDefaultDirection = String(defaultDirection).toLowerCase();
    const fallbackDirection = ORDER_DIRECTIONS.has(normalizedDefaultDirection) ? normalizedDefaultDirection : 'asc';
    const orderDir = ORDER_DIRECTIONS.has(rawDirection) ? rawDirection : fallbackDirection;
    const requestedColumn = columns[columnIndex];

    return {
        orderBy: requestedColumn || fallbackColumn,
        orderDir
    };
};


export const buildDateRangeFilter = ({
    field,
    startDate = '',
    endDate = ''
} = {}) => {

    if (!field || (!startDate && !endDate)) return {};

    return {
        [field]: {
            ...(startDate && {
                gte: new Date(startDate)
            }),
            ...(endDate && (() => {

                const nextDay = new Date(endDate);
                nextDay.setDate(nextDay.getDate() + 1);

                return {
                    lt: nextDay
                };
            })())
        }
    };
};
