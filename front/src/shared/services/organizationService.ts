import { requestPage } from '../http/pageRequest.js';
import { readText } from '../http/recordContract.js';
import type { LookupItem } from '../lookup.js';

export const organizationService = {
    async options(
        resource: 'departments' | 'roles',
        search: string,
        page: number,
        signal: AbortSignal,
    ) {
        const params = new URLSearchParams({
            start: String((page - 1) * 20),
            length: '20',
            search,
        });
        const result = await requestPage(`/api/admin/${resource}?${params}`, signal);
        return {
            ...result,
            data: result.data.map((value): LookupItem => ({
                id: readText(value, 'id'),
                title: readText(value, 'name'),
                data: value,
            })),
        };
    },
};
