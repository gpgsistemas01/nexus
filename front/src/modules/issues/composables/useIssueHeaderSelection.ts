import { computed, watch } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import {
    isInternalClientName,
    resolveAdvisorDepartmentByClientName,
    resolveProjectNumberByClientAndDepartment,
} from '@nexus/issue-header-rules';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { issueLookupService } from '../services/issueLookupService.js';
import { useIssueDepartments } from './useIssueDepartments.js';
import type { IssueResource, IssueValues, IssueDocument } from '../issue.js';
import type { LookupItem } from '../../../shared/lookup.js';

export const useIssueHeaderSelection = (options: {
    resource: IssueResource;
    values: IssueValues;
    document?: IssueDocument;
    isEnabled: () => boolean;
    has: (permission: string) => boolean;
    selectClient: (id: string) => void;
    setHeaderField: (
        field: 'advisorId' | 'requesterId' | 'projectNumber' | 'departmentId',
        value: string,
    ) => void;
}) => {
    const canReadClients = computed(() => options.has(PERMISSIONS.CLIENTS_READ));
    const canReadDepartments = computed(() => options.has(PERMISSIONS.DEPARTMENTS_READ));
    const canReadPersons = computed(() => options.has(PERMISSIONS.PERSONS_READ));
    const clients = useRemoteLookup(
        (search, page, signal) =>
            issueLookupService.list('clients', options.resource, search, page, signal),
        computed(() => options.isEnabled() && canReadClients.value),
    );
    const departments = useIssueDepartments({
        resource: options.resource,
        isEnabled: () => options.isEnabled() && canReadDepartments.value,
        getSelectedId: () => options.values.departmentId,
        selectDefault: (id) => {
            if (!options.document) options.setHeaderField('departmentId', id);
        },
    });

    const createInitialOption = (id: string, title: string): LookupItem => ({
        id,
        title,
        data: {},
    });

    const issueDocument = options.document;
    const selectedClient = useSelectedOption(
        clients.items,
        () => options.values.clientId,
        () =>
            issueDocument
                ? createInitialOption(issueDocument.clientId, issueDocument.clientName)
                : undefined,
    );
    const selectedDepartment = useSelectedOption(
        departments.items,
        () => options.values.departmentId,
        () =>
            issueDocument
                ? createInitialOption(issueDocument.departmentId, issueDocument.departmentName)
                : undefined,
    );
    const initialOptions = computed(() => ({
        clientId: selectedClient.value,
        departmentId: selectedDepartment.value,
        advisorId: issueDocument
            ? createInitialOption(issueDocument.advisorId, issueDocument.advisorName)
            : undefined,
        requesterId: issueDocument
            ? createInitialOption(issueDocument.requesterId, issueDocument.requesterName)
            : undefined,
    }));
    const clientName = computed(() => selectedClient.value?.title ?? '');
    const departmentName = computed(() => selectedDepartment.value?.title ?? '');
    const advisors = useRemoteLookup(
        (search, page, signal) =>
            issueLookupService.list(
                'persons',
                options.resource,
                search,
                page,
                signal,
                isInternalClientName(clientName.value)
                    ? { role: 'Coordinador' }
                    : {
                          department: resolveAdvisorDepartmentByClientName({
                              clientName: clientName.value,
                          }),
                          strictDepartmentFilter: 'true',
                      },
            ),
        computed(() => options.isEnabled() && canReadPersons.value && !!clientName.value),
        clientName,
    );
    const requesters = useRemoteLookup(
        (search, page, signal) =>
            issueLookupService.list('persons', options.resource, search, page, signal, {
                department: departmentName.value,
                strictDepartmentFilter: 'true',
            }),
        computed(() => options.isEnabled() && canReadPersons.value && !!departmentName.value),
        departmentName,
    );

    const updateSuggestedProjectNumber = () =>
        options.setHeaderField(
            'projectNumber',
            resolveProjectNumberByClientAndDepartment({
                clientName: clientName.value,
                departmentName: departmentName.value,
            }),
        );

    watch(
        () => options.values.clientId,
        () => {
            options.setHeaderField('advisorId', '');
            options.setHeaderField('projectNumber', '');
        },
        { flush: 'sync' },
    );
    watch(
        () => options.values.departmentId,
        () => {
            options.setHeaderField('requesterId', '');
            options.setHeaderField('projectNumber', '');
        },
        { flush: 'sync' },
    );

    watch([clientName, departmentName], () => {
        if (options.isEnabled()) updateSuggestedProjectNumber();
    });

    const selectCreatedClient = (item: LookupItem) => {
        if (!options.isEnabled()) return;

        if (item.isDisabled) {
            void clients.refresh();
            return;
        }

        selectedClient.value = item;
        options.selectClient(item.id);
        clients.updateSearch('');
        void clients.refresh();
    };

    return {
        selectCreatedClient,
        clients,
        departments,
        advisors,
        requesters,
        initialOptions,
        canReadClients,
        canReadDepartments,
        canReadPersons,
    };
};
