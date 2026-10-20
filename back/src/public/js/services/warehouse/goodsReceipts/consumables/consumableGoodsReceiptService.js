import { createGoodsReceiptRequests } from '../createGoodsReceiptRequests.js';

export const CONSUMABLE_GOODS_RECEIPTS_API_ROUTE = '/api/warehouse/goods-receipts/consumables';

const requests = createGoodsReceiptRequests({
    apiRoute: CONSUMABLE_GOODS_RECEIPTS_API_ROUTE,
    reportRoute: '/api/warehouse/reports/goods-receipts/consumables/excel'
});

export const getAllConsumableGoodsReceiptsRequest = requests.getAllGoodsReceiptsRequest;
export const registerConsumableGoodsReceiptRequest = requests.registerGoodsReceiptRequest;
export const editConsumableGoodsReceiptHeaderRequest = requests.editGoodsReceiptHeaderRequest;
export const correctConsumableGoodsReceiptDetailRequest = requests.correctGoodsReceiptDetailRequest;
export const cancelConsumableGoodsReceiptDetailRequest = requests.cancelGoodsReceiptDetailRequest;
export const exportConsumableGoodsReceiptReportRequest = requests.exportReportRequest;
