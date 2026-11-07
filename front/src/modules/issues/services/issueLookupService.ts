import { requestPage } from '../../../shared/http/pageRequest.js';
import { API_PATHS } from '../../../shared/http/apiPaths.js';
import { lookupParams } from '../../../shared/http/pageParams.js';
import { readText } from '../../../shared/http/recordContract.js';
import { mapIssueItemOption } from '../mappers/issueResponseMapper.js';
import type { IssueResource, IssueLookup } from '../issue.js';
import type { LookupItem, LookupQuery } from '../../../shared/lookup.js';

interface IssueLookupRequest extends LookupQuery {
    kind: IssueLookup;
    resource: IssueResource;
    filters?: Record<string, string | string[]>;
}

export const issueLookupService = {
    async list(query: IssueLookupRequest, signal: AbortSignal) {
        const { kind, resource } = query;
        const params = lookupParams(query);
        if (kind === 'departments') params.set('context', 'issues');

        for (const [key, value] of Object.entries(query.filters ?? {})) {
            if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
            else params.set(key, value);
        }

        const path = {
            clients: API_PATHS.directory.clients,
            departments: API_PATHS.organization.departments,
            persons: API_PATHS.identity.persons,
            statuses: API_PATHS.fulfillmentStatuses,
            items: API_PATHS.inventory[resource],
        }[kind];
        const result = await requestPage(`${path}?${params}`, signal);
        return {
            ...result,
            data: result.data.map((row): LookupItem =>
                kind === 'items'
                    ? mapIssueItemOption(row, resource)
                    : {
                          id: readText(row, 'id'),
                          title: readText(row, kind === 'persons' ? 'fullName' : 'name'),
                          data: row,
                          isDisabled: row.isActive === false,
                      },
            ),
        };
    },
};
