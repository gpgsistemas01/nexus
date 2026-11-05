import { successCodeMessages } from '@nexus/api-success-codes';
import { apiClient } from '../../../shared/http/apiClient.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { recordParams } from '../../../shared/http/recordParams.js';
import { confirmMutation } from '../../../shared/http/recordContract.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import { reportScopeError } from '../../../shared/report.js';
import type { ReportScope } from '../../../shared/report.js';
import type { IssueResource, IssueQuery, IssueWriteTarget } from '../issue.js';
import { normalizeIssueDocument, normalizeIssueRow } from '../mappers/issueResponseMapper.js';

const getIssueEndpoint = (resource: IssueResource) =>
    resource === 'wastes'
        ? '/api/warehouse/waste-issues'
        : `/api/warehouse/goods-issues/${resource}`;

const buildIssueQueryParams = (query: IssueQuery) => {
    const params = recordParams(query);
    for (const key of [
        'startDate',
        'endDate',
        'clientId',
        'departmentId',
        'personId',
        'fulfillmentStatusId',
        'observationsSearch',
    ] as const)
        params.set(key, query[key]);
    return params;
};

const ISSUE_SUCCESS_CODES = {
    goods: {
        created: successCodeMessages.CREATED_GOODS_ISSUE,
        updated: successCodeMessages.UPDATED_GOODS_ISSUE,
    },
    wastes: {
        created: successCodeMessages.CREATED_WASTE_ISSUE,
        updated: successCodeMessages.UPDATED_WASTE_ISSUE,
    },
};
export const issueService = {
    async list(resource: IssueResource, query: IssueQuery, signal: AbortSignal) {
        const result = await requestPage(
            `${getIssueEndpoint(resource)}?${buildIssueQueryParams(query)}`,
            signal,
        );
        return { ...result, data: result.data.map((row) => normalizeIssueRow(row, resource)) };
    },
    async get(resource: IssueResource, id: string, signal: AbortSignal) {
        const result = await apiClient.request<Record<string, unknown>>(
            `${getIssueEndpoint(resource)}/${encodeURIComponent(id)}`,
            { signal },
        );
        const document = normalizeIssueDocument(
            result[resource === 'wastes' ? 'wasteIssue' : 'goodsIssue'],
            resource,
        );
        if (document.id !== id)
            throw new Error('La salida recibida no coincide con la solicitada.');

        return document;
    },
    async save(options: {
        resource: IssueResource;
        target: IssueWriteTarget;
        payload: Record<string, unknown>;
        signal: AbortSignal;
    }) {
        const { resource, target, payload, signal } = options;
        const isCreating = target.mode === 'create';
        const documentPath = isCreating ? '' : `/${encodeURIComponent(target.document.id)}`;
        const section =
            target.mode === 'header' ? '/header' : target.mode === 'supply' ? '/details' : '';
        const response = await apiClient.request(
            `${getIssueEndpoint(resource)}${documentPath}${section}`,
            { method: isCreating ? 'POST' : 'PATCH', data: payload, signal },
        );
        return confirmMutation(
            response,
            ISSUE_SUCCESS_CODES[resource === 'wastes' ? 'wastes' : 'goods'][
                isCreating ? 'created' : 'updated'
            ],
        );
    },
    async returnDetail(options: {
        resource: IssueResource;
        documentId: string;
        detailId: string;
        payload: Record<string, unknown>;
        signal: AbortSignal;
    }) {
        const { resource, documentId, detailId, payload, signal } = options;
        const response = await apiClient.request(
            `${getIssueEndpoint(resource)}/${encodeURIComponent(documentId)}/details/${encodeURIComponent(detailId)}/returns`,
            { method: 'PATCH', data: payload, signal },
        );
        return confirmMutation(
            response,
            ISSUE_SUCCESS_CODES[resource === 'wastes' ? 'wastes' : 'goods'].updated,
        );
    },
    export(resource: IssueResource, query: IssueQuery, scope: ReportScope, signal: AbortSignal) {
        const error = reportScopeError(scope);
        if (error) throw new Error(error);

        const params =
            scope.mode === 'filtered'
                ? buildIssueQueryParams(query)
                : new URLSearchParams({
                      monthlyReport: 'true',
                      reportMonth: scope.mode === 'specific-month' ? scope.month : '',
                  });
        params.delete('start');
        params.delete('length');
        const path = resource === 'wastes' ? 'waste-issues' : `goods-issues/${resource}`;
        return requestExcel(`/api/warehouse/reports/${path}/excel?${params}`, signal);
    },
};
