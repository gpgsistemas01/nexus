import { findConsumableGoodsReceiptReportRows } from '../../../../../services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js';
import { MATERIAL_TYPES } from '../../../../../constants/inventory.js';
import { exportGoodsReceiptReportExcel } from '../../reportController.js';

export const exportConsumableGoodsReceiptReportExcel = (req, res) => exportGoodsReceiptReportExcel({
    req,
    res,
    materialType: MATERIAL_TYPES.CONSUMABLE,
    findGoodsReceiptReportRows: findConsumableGoodsReceiptReportRows
});
