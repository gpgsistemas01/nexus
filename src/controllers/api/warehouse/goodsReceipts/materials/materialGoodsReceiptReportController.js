import { findMaterialGoodsReceiptReportRows } from '../../../../../services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js';
import { MATERIAL_TYPES } from '../../../../../constants/inventory.js';
import { exportGoodsReceiptReportExcel } from '../../reportController.js';

export const exportMaterialGoodsReceiptReportExcel = (req, res) => exportGoodsReceiptReportExcel({
    req,
    res,
    materialType: MATERIAL_TYPES.MATERIAL,
    findGoodsReceiptReportRows: findMaterialGoodsReceiptReportRows
});
