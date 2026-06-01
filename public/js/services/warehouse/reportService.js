import { apiRequest } from "../axiosInstanceApi.js";

export const exportWarehouseReportRequest = async () =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/inventory/excel',
        responseType: 'blob'
    });

export const exportGoodsIssueReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/goods-issues/excel',
        responseType: 'blob',
        params
    });

export const exportGoodsReceiptReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/goods-receipts/excel',
        responseType: 'blob',
        params
    });
