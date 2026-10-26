import type { RecordQuery } from '../list.js';

export const recordParams = (query: RecordQuery, { paginate = true } = {}) =>
    new URLSearchParams({
        ...(paginate
            ? {
                  start: String((query.page - 1) * query.length),
                  length: String(query.length),
              }
            : {}),
        search: query.search,
        'order[0][column]': String(query.orderColumn),
        'order[0][dir]': query.direction,
    });
