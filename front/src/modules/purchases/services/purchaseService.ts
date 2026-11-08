import { successCodeMessages } from '@nexus/api-success-codes';
import { apiClient } from '../../../shared/http/apiClient.js';
import { API_PATHS } from '../../../shared/http/apiPaths.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { recordParams } from '../../../shared/http/recordParams.js';
import { confirmMutation } from '../../../shared/http/recordContract.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import {
    normalizePurchaseDocument,
    normalizePurchaseRow,
} from '../mappers/purchaseResponseMapper.js';
import { reportParams } from '../../../shared/report.js';
import type { ReportScope } from '../../../shared/report.js';
import type {
    PurchaseResource,
    PurchaseQuery,
    PurchaseWriteTarget,
    PurchaseDetailChange,
} from '../purchase.js';

const buildPurchaseQueryParams = (query: PurchaseQuery) => {
    const params = recordParams(query);
    for (const key of ['supplierId', 'personId', 'startDate', 'endDate'] as const)
        params.set(key, query[key]);
    return params;
};

export const purchaseService = {
    async list(resource: PurchaseResource, query: PurchaseQuery, signal: AbortSignal) {
        const result = await requestPage(
            `${API_PATHS.purchases[resource]}?${buildPurchaseQueryParams(query)}`,
            signal,
        );
        return { ...result, data: result.data.map((row) => normalizePurchaseRow(row, resource)) };
    },
    async get(resource: PurchaseResource, id: string, signal: AbortSignal) {
        const result = await apiClient.request<{ goodsReceipt: unknown }>(
            `${API_PATHS.purchases[resource]}/${encodeURIComponent(id)}`,
            { signal },
        );
        const document = normalizePurchaseDocument(result.goodsReceipt, resource);
        if (document.id !== id)
            throw new Error('La compra recibida no coincide con la solicitada.');

        return document;
    },
    async save(options: {
        resource: PurchaseResource;
        target: PurchaseWriteTarget;
        payload: Record<string, unknown>;
        signal: AbortSignal;
    }) {
        const { resource, target, payload, signal } = options;
        const documentPath =
            target.action === 'edit' ? `/${encodeURIComponent(target.document.id)}` : '';
        const response = await apiClient.request(
            `${API_PATHS.purchases[resource]}${documentPath}`,
            { method: target.action === 'edit' ? 'PATCH' : 'POST', data: payload, signal },
        );
        return confirmMutation(
            response,
            target.action === 'edit'
                ? successCodeMessages.UPDATED_GOODS_RECEIPT
                : successCodeMessages.CREATED_GOODS_RECEIPT,
        );
    },
    async changeDetail(options: {
        resource: PurchaseResource;
        documentId: string;
        detailId: string;
        change: PurchaseDetailChange;
        signal: AbortSignal;
    }) {
        const { resource, documentId, detailId, change, signal } = options;
        const actionPath = change.action === 'correct' ? 'corrections' : 'cancel';
        const data =
            change.action === 'correct'
                ? { quantity: change.quantity, costPerUnitType: change.costPerUnitType }
                : undefined;
        const response = await apiClient.request(
            `${API_PATHS.purchases[resource]}/${encodeURIComponent(documentId)}/details/${encodeURIComponent(detailId)}/${actionPath}`,
            { method: 'PATCH', ...(data ? { data } : {}), signal },
        );
        return confirmMutation(response, successCodeMessages.UPDATED_GOODS_RECEIPT);
    },
    export(
        resource: PurchaseResource,
        query: PurchaseQuery,
        scope: ReportScope,
        signal: AbortSignal,
    ) {
        const params = reportParams(buildPurchaseQueryParams(query), scope);
        return requestExcel(`${API_PATHS.reports.purchases[resource]}?${params}`, signal);
    },
};
