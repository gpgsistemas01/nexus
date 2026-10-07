import * as materialRequests from './materials/materialGoodsReceiptService.js';
import * as consumableRequests from './consumables/consumableGoodsReceiptService.js';
import { goodsReceiptContext } from '../../../pages/warehouse/goodsReceipts/goodsReceiptContext.js';

const consumable = goodsReceiptContext.resource === 'consumable';
export const GOODS_RECEIPTS_API_ROUTE = consumable ? consumableRequests.CONSUMABLE_GOODS_RECEIPTS_API_ROUTE : materialRequests.MATERIAL_GOODS_RECEIPTS_API_ROUTE;
export const getAllGoodsReceiptsRequest = consumable ? consumableRequests.getAllConsumableGoodsReceiptsRequest : materialRequests.getAllMaterialGoodsReceiptsRequest;
export const registerGoodsReceiptRequest = consumable ? consumableRequests.registerConsumableGoodsReceiptRequest : materialRequests.registerMaterialGoodsReceiptRequest;
export const editGoodsReceiptHeaderRequest = consumable ? consumableRequests.editConsumableGoodsReceiptHeaderRequest : materialRequests.editMaterialGoodsReceiptHeaderRequest;
export const correctGoodsReceiptDetailRequest = consumable ? consumableRequests.correctConsumableGoodsReceiptDetailRequest : materialRequests.correctMaterialGoodsReceiptDetailRequest;
export const cancelGoodsReceiptDetailRequest = consumable ? consumableRequests.cancelConsumableGoodsReceiptDetailRequest : materialRequests.cancelMaterialGoodsReceiptDetailRequest;
export const exportGoodsReceiptReportRequest = consumable ? consumableRequests.exportConsumableGoodsReceiptReportRequest : materialRequests.exportMaterialGoodsReceiptReportRequest;
