import { zonedDateTimeToUtcIso } from '@nexus/date-time';
import { getIssueDetailsToSupply } from '../issueDetails.js';
import type { IssueValues, IssueResource, IssueWriteMode } from '../issue.js';

export const mapIssueFormToRequest = (
    values: IssueValues,
    resource: IssueResource,
    mode: IssueWriteMode,
): Record<string, unknown> => {
    if (mode === 'supply')
        return {
            details: getIssueDetailsToSupply(values.details).map((row) => ({
                id: row.id,
                isSupplied: true,
                projectConvertedQuantity: Number(row.projectConvertedQuantity),
            })),
        };

    const header = {
        clientId: values.clientId,
        advisorId: values.advisorId,
        departmentId: values.departmentId,
        requesterId: values.requesterId,
        projectNumber: values.projectNumber.trim(),
        requestDate: zonedDateTimeToUtcIso(new Date(values.requestDate)),
        observations: values.observations.trim(),
    };
    if (mode === 'header') return header;

    return {
        ...header,
        details: values.details.map((row) =>
            resource === 'wastes'
                ? { wasteId: row.itemId, quantity: row.quantity }
                : { materialId: row.itemId, supplierId: row.supplierId, quantity: row.quantity },
        ),
    };
};
