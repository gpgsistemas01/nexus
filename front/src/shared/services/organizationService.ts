import { requestPage } from '../http/pageRequest.js';
import { API_PATHS } from '../http/apiPaths.js';
import { lookupParams } from '../http/pageParams.js';
import { readText } from '../http/recordContract.js';
import type { LookupItem, LookupQuery, OrganizationResource } from '../lookup.js';

interface OrganizationLookupRequest extends LookupQuery {
    resource: OrganizationResource;
}

export const organizationService = {
    async options(query: OrganizationLookupRequest, signal: AbortSignal) {
        const params = lookupParams(query);
        const result = await requestPage(
            `${API_PATHS.organization[query.resource]}?${params}`,
            signal,
        );
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
