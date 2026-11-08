import type { RecordQuery } from '../list.js';
import type { LookupQuery } from '../lookup.js';

export const pageParams = (
    query: Pick<RecordQuery, 'page' | 'length' | 'search'>,
    { paginate = true } = {},
) =>
    new URLSearchParams({
        ...(paginate
            ? {
                  start: String((query.page - 1) * query.length),
                  length: String(query.length),
              }
            : {}),
        search: query.search,
    });

export const LOOKUP_PAGE_SIZE = 20;

export const lookupParams = (query: LookupQuery) =>
    pageParams({ ...query, length: LOOKUP_PAGE_SIZE });
