import * as materialApplication from './materials/materialGoodsReceipts.js';
import * as consumableApplication from './consumables/consumableGoodsReceipts.js';
import { goodsReceiptContext } from '../../../pages/warehouse/goodsReceipts/goodsReceiptContext.js';

const consumable = goodsReceiptContext.resource === 'consumable';
export const getAllGoodsReceipts = consumable ? consumableApplication.getAllConsumableGoodsReceipts : materialApplication.getAllMaterialGoodsReceipts;
export const registerGoodsReceipt = consumable ? consumableApplication.registerConsumableGoodsReceipt : materialApplication.registerMaterialGoodsReceipt;
export const editGoodsReceiptHeader = consumable ? consumableApplication.editConsumableGoodsReceiptHeader : materialApplication.editMaterialGoodsReceiptHeader;
export const correctGoodsReceiptDetail = consumable ? consumableApplication.correctConsumableGoodsReceiptDetail : materialApplication.correctMaterialGoodsReceiptDetail;
export const cancelGoodsReceiptDetail = consumable ? consumableApplication.cancelConsumableGoodsReceiptDetail : materialApplication.cancelMaterialGoodsReceiptDetail;
