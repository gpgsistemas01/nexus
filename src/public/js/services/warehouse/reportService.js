import { apiRequest } from "../axiosInstanceApi.js";
export { exportGoodsIssueReportRequest } from './goodsIssues/goodsIssueService.js';
export { exportGoodsReceiptReportRequest } from './goodsReceipts/goodsReceiptService.js';

export const exportWarehouseReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/inventory/excel',
        responseType: 'blob',
        params
    });

export const exportWasteIssueReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/waste-issues/excel',
        responseType: 'blob',
        params
    });


export const exportWasteReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/wastes/excel',
        responseType: 'blob',
        params
    });


export const exportSupplierReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/suppliers/excel',
        responseType: 'blob',
        params
    });
