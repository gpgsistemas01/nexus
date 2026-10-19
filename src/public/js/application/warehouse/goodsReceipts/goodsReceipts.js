import { getGoodsReceiptRequest } from '../../../services/warehouse/goodsReceipts/goodsReceiptService.js';
import * as materialApplication from './materials/materialGoodsReceipts.js';
import * as consumableApplication from './consumables/consumableGoodsReceipts.js';
import { exportMaterialGoodsReceiptReportRequest } from '../../../services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js';
import { exportConsumableGoodsReceiptReportRequest } from '../../../services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js';
import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';
import { createReportApplication } from '../../createReportApplication.js';

export const createGoodsReceiptApplication = ({ resource }) => {
    const consumable = resource === INVENTORY_RESOURCES.CONSUMABLE;

    return Object.freeze({
        getAll: consumable ? consumableApplication.getAllConsumableGoodsReceipts : materialApplication.getAllMaterialGoodsReceipts,
        register: consumable ? consumableApplication.registerConsumableGoodsReceipt : materialApplication.registerMaterialGoodsReceipt,
        editHeader: consumable ? consumableApplication.editConsumableGoodsReceiptHeader : materialApplication.editMaterialGoodsReceiptHeader,
        correctDetail: consumable ? consumableApplication.correctConsumableGoodsReceiptDetail : materialApplication.correctMaterialGoodsReceiptDetail,
        cancelDetail: consumable ? consumableApplication.cancelConsumableGoodsReceiptDetail : materialApplication.cancelMaterialGoodsReceiptDetail,
        get: async ({ id }) => (await getGoodsReceiptRequest({ id, resource })).data.goodsReceipt,
        exportReport: createReportApplication(consumable ? exportConsumableGoodsReceiptReportRequest : exportMaterialGoodsReceiptReportRequest)
    });
};
