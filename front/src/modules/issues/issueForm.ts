import { formatDateTimeInputInTimeZone } from '@nexus/date-time';
import {
    goodsIssueValidation,
    wasteIssueValidation,
    issueHeaderValidation,
    issueProjectQuantityDetailsValidation,
} from '@nexus/form-validation';
import { getIssueDetailsToSupply } from './issueDetails.js';
import { mapIssueFormToRequest } from './mappers/issueRequestMapper.js';
import type {
    IssueDocument,
    IssueValues,
    IssueResource,
    IssueMode,
    IssueFilters,
} from './issue.js';

export const createInitialIssueValues = (document?: IssueDocument): IssueValues => ({
    clientId: document?.clientId ?? '',
    advisorId: document?.advisorId ?? '',
    departmentId: document?.departmentId ?? '',
    requesterId: document?.requesterId ?? '',
    projectNumber: document?.projectNumber ?? '',
    requestDate: formatDateTimeInputInTimeZone(document?.requestDate ?? new Date().toISOString()),
    observations: document?.observations ?? '',
    details: document?.details.map((row) => ({ ...row })) ?? [],
});

export const emptyIssueFilters = (): IssueFilters => ({
    startDate: '',
    endDate: '',
    clientId: '',
    departmentId: '',
    personId: '',
    fulfillmentStatusId: '',
    observationsSearch: '',
});

export const createIssueValidationSchema = (options: {
    resource: IssueResource;
    mode: IssueMode;
    getValues: () => IssueValues;
}) => {
    const { resource, mode, getValues } = options;
    if (mode === 'view' || mode === 'return') return {};

    if (mode === 'supply')
        return {
            details: () => {
                const details = getIssueDetailsToSupply(getValues().details);
                if (!details.length) return 'Seleccione al menos un detalle pendiente por surtir.';

                for (const detail of details) {
                    const error = issueProjectQuantityDetailsValidation.projectConvertedQuantity(
                        detail.projectConvertedQuantity,
                    );
                    if (error) return `${detail.name}: ${error}`;
                }

                return true;
            },
        };

    const rules = (
        mode === 'header'
            ? issueHeaderValidation
            : resource === 'wastes'
              ? wasteIssueValidation
              : goodsIssueValidation
    ) as Record<string, (value: unknown) => string | null>;
    return Object.fromEntries(
        Object.entries(rules).map(([field, rule]) => [
            field,
            () => {
                const values = getValues();
                const request = mapIssueFormToRequest(values, resource, mode);
                return rule(field === 'requestDate' ? values.requestDate : request[field]) || true;
            },
        ]),
    );
};
