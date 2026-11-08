import type { RecordQuery } from '../list.js';
import { pageParams } from './pageParams.js';

export const recordParams = (query: RecordQuery, { paginate = true } = {}) => {
    const params = pageParams(query, { paginate });
    params.set('order[0][column]', String(query.orderColumn));
    params.set('order[0][dir]', query.direction);
    return params;
};
