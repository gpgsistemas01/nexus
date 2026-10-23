import { apiClient } from '../../../shared/http/apiClient.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { recordParams } from '../../../shared/http/recordParams.js';
import { confirmMutation } from '../../../shared/http/recordContract.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import { normalizePurchaseDocument, normalizePurchaseRow } from '../mappers/purchaseMapper.js';
import { reportScopeError } from '../../../shared/report.js';
import type { ReportScope } from '../../../shared/report.js';
import type { PurchaseResource, PurchaseQuery } from '../purchase.js';

const endpoint = (resource: PurchaseResource) => `/api/warehouse/goods-receipts/${resource}`;

const purchaseParams = (query: PurchaseQuery) => {
    const params = recordParams(query);
    for (const key of ['supplierId', 'personId', 'startDate', 'endDate'] as const)
        params.set(key, query[key]);
    return params;
};

export const purchaseService = {
    async list(resource: PurchaseResource, query: PurchaseQuery, signal: AbortSignal) {
        const result = await requestPage(`${endpoint(resource)}?${purchaseParams(query)}`, signal);
        return { ...result, data: result.data.map((row) => normalizePurchaseRow(row, resource)) };
    },
    async get(resource: PurchaseResource, id: string, signal: AbortSignal) {
        const result = await apiClient.request<{ goodsReceipt: unknown }>(
            `${endpoint(resource)}/${encodeURIComponent(id)}`,
            { signal },
        );
        const document = normalizePurchaseDocument(result.goodsReceipt, resource);
        if (document.id !== id)
            throw new Error('La compra recibida no coincide con la solicitada.');

        return document;
    },
    async save(
        resource: PurchaseResource,
        payload: Record<string, unknown>,
        signal: AbortSignal,
        id?: string,
    ) {
        const result = await apiClient.request(
            `${endpoint(resource)}${id ? `/${encodeURIComponent(id)}` : ''}`,
            { method: id ? 'PATCH' : 'POST', data: payload, signal },
        );
        confirmMutation(result, id ? 'UPDATED_GOODS_RECEIPT' : 'CREATED_GOODS_RECEIPT');
    },
    async changeDetail(
        resource: PurchaseResource,
        id: string,
        detailId: string,
        action: 'corrections' | 'cancel',
        signal: AbortSignal,
        data?: Record<string, unknown>,
    ) {
        const result = await apiClient.request(
            `${endpoint(resource)}/${encodeURIComponent(id)}/details/${encodeURIComponent(detailId)}/${action}`,
            { method: 'PATCH', ...(data ? { data } : {}), signal },
        );
        confirmMutation(result, 'UPDATED_GOODS_RECEIPT');
    },
    export(
        resource: PurchaseResource,
        query: PurchaseQuery,
        scope: ReportScope,
        signal: AbortSignal,
    ) {
        const error = reportScopeError(scope);
        if (error) throw new Error(error);

        const params =
            scope.mode === 'filtered'
                ? purchaseParams(query)
                : new URLSearchParams({
                      monthlyReport: 'true',
                      reportMonth: scope.mode === 'specific-month' ? scope.month : '',
                      'order[0][column]': String(query.orderColumn),
                      'order[0][dir]': query.direction,
                  });
        params.delete('start');
        params.delete('length');
        return requestExcel(
            `/api/warehouse/reports/goods-receipts/${resource}/excel?${params}`,
            signal,
        );
    },
};
