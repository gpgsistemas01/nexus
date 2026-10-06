import { apiRequest } from "../axiosInstanceApi.js";
import { goodsReceiptContext } from '../../pages/warehouse/goodsReceipts/goodsReceiptContext.js';

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

export const exportGoodsReceiptReportRequest = async (params = {}) =>
    apiRequest({
        method: 'get',
        url: `/api/warehouse/reports/goods-receipts/${ goodsReceiptContext.resource === 'consumable' ? 'consumables' : 'materials' }/excel`,
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
