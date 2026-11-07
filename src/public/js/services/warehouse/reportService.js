import { apiRequest } from "../axiosInstanceApi.js";
import { INVENTORY_RESOURCES } from '../../constants/inventory.js';

export const exportWarehouseReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/inventory/excel',
        responseType: 'blob',
        params
    });

export const exportGoodsIssueReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: '/api/warehouse/reports/goods-issues/excel',
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

export const exportGoodsReceiptReportRequest = async ({ resource, ...params } = {}) =>
    apiRequest({
        method: 'get',
        url: `/api/warehouse/reports/goods-receipts/${ resource === INVENTORY_RESOURCES.CONSUMABLE ? 'consumables' : 'materials' }/excel`,
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
