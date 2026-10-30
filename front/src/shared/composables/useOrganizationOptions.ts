import { computed } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { organizationService } from '../services/organizationService.js';
import type { OrganizationState } from '../lookup.js';
import { useRemoteLookup } from './useRemoteLookup.js';

export const useOrganizationOptions = (permissions: readonly string[]) => {
    const departments = useRemoteLookup(
        (search, page, signal) =>
            organizationService.options({ resource: 'departments', search, page }, signal),
        computed(() => permissions.includes(PERMISSIONS.DEPARTMENTS_READ)),
    );
    const roles = useRemoteLookup(
        (search, page, signal) =>
            organizationService.options({ resource: 'roles', search, page }, signal),
        computed(() => permissions.includes(PERMISSIONS.ROLES_READ)),
    );
    const state = computed<OrganizationState>(() => ({
        departments: departments.state.value,
        roles: roles.state.value,
    }));
    return { departments, roles, state };
};
