import { computed, reactive } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { issueLookupService } from '../services/issueLookupService.js';
import { ISSUE_FILTER_SELECTS } from '../issueConfig.js';
import { emptyIssueFilters } from '../issueForm.js';
import type { IssueResource, IssueLookup } from '../issue.js';

export const useIssueFilters = (resource: IssueResource, has: (permission: string) => boolean) => {
    const values = reactive(emptyIssueFilters());

    const createFilterLookup = (kind: IssueLookup, permission: string) =>
        useRemoteLookup(
            (search, page, signal) => issueLookupService.list(kind, resource, search, page, signal),
            computed(() => has(permission)),
        );

    const lookups = {
        clients: createFilterLookup('clients', PERMISSIONS.CLIENTS_READ),
        departments: createFilterLookup('departments', PERMISSIONS.DEPARTMENTS_READ),
        persons: createFilterLookup('persons', PERMISSIONS.PERSONS_READ),
        statuses: createFilterLookup('statuses', PERMISSIONS.FULFILLMENT_STATUSES_READ),
    };
    const selects = computed(() =>
        ISSUE_FILTER_SELECTS.map((item) => ({
            ...item,
            state: lookups[item.kind].state.value,
            isDisabled: !has(item.permission),
        })),
    );

    const clear = () => {
        Object.assign(values, emptyIssueFilters());
        for (const lookup of Object.values(lookups)) lookup.updateSearch('');
    };

    return { values, lookups, selects, clear };
};
