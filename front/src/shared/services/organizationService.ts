import { requestPage } from '../http/pageRequest.js';
import { readText } from '../http/recordContract.js';
import type { LookupItem, LookupQuery, OrganizationResource } from '../lookup.js';

interface OrganizationLookupRequest extends LookupQuery {
    resource: OrganizationResource;
}

export const organizationService = {
    async options(query: OrganizationLookupRequest, signal: AbortSignal) {
        const { resource, search, page } = query;
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
