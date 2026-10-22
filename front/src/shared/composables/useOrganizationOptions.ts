import { computed } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { organizationService } from '../services/organizationService.js';
import type { OrganizationState } from '../lookup.js';
import { useRemoteLookup } from './useRemoteLookup.js';

export const useOrganizationOptions = (permissions: readonly string[]) => {
    const departments = useRemoteLookup(
        (search, page, signal) => organizationService.options('departments', search, page, signal),
        computed(() => permissions.includes(PERMISSIONS.DEPARTMENTS_READ)),
    );
    const roles = useRemoteLookup(
        (search, page, signal) => organizationService.options('roles', search, page, signal),
        computed(() => permissions.includes(PERMISSIONS.ROLES_READ)),
    );
    const state = computed(
        () =>
            Object.fromEntries(
                Object.entries({ departments, roles }).map(([key, lookup]) => [
                    key,
                    {
                        items: lookup.items.value,
                        isLoading: lookup.isLoading.value,
                        error: lookup.error.value,
                        hasMore: lookup.hasMore.value,
                    },
                ]),
            ) as OrganizationState,
    );
    return { departments, roles, state };
};
