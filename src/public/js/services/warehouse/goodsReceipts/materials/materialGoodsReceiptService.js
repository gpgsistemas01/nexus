import { createGoodsReceiptRequests } from '../createGoodsReceiptRequests.js';

export const MATERIAL_GOODS_RECEIPTS_API_ROUTE = '/api/warehouse/goods-receipts/materials';

const requests = createGoodsReceiptRequests({
    apiRoute: MATERIAL_GOODS_RECEIPTS_API_ROUTE,
    reportRoute: '/api/warehouse/reports/goods-receipts/materials/excel'
});

export const getAllMaterialGoodsReceiptsRequest = requests.getAllGoodsReceiptsRequest;
export const registerMaterialGoodsReceiptRequest = requests.registerGoodsReceiptRequest;
export const editMaterialGoodsReceiptHeaderRequest = requests.editGoodsReceiptHeaderRequest;
export const correctMaterialGoodsReceiptDetailRequest = requests.correctGoodsReceiptDetailRequest;
export const cancelMaterialGoodsReceiptDetailRequest = requests.cancelGoodsReceiptDetailRequest;
export const exportMaterialGoodsReceiptReportRequest = requests.exportReportRequest;
