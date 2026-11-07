import { MATERIAL_TYPES } from '../../../../constants/inventory.js';
import { cancelGoodsReceiptDetailLine } from '../detailChanges/goodsReceiptCancellationService.js';
import { correctGoodsReceiptDetailLine } from '../detailChanges/goodsReceiptCorrectionService.js';
import { createGoodsReceipt, findAllGoodsReceipts, updateGoodsReceipt } from '../goodsReceiptService.js';
import { findGoodsReceiptReportRows } from '../../reportService.js';

const type = MATERIAL_TYPES.MATERIAL;

export const findAllMaterialGoodsReceipts = options => findAllGoodsReceipts({ ...options, type });
export const createMaterialGoodsReceipt = options => createGoodsReceipt({ ...options, type });
export const updateMaterialGoodsReceipt = options => updateGoodsReceipt({ ...options, type });
export const correctMaterialGoodsReceiptDetailLine = options => correctGoodsReceiptDetailLine({ ...options, type });
export const cancelMaterialGoodsReceiptDetailLine = options => cancelGoodsReceiptDetailLine({ ...options, type });
export const findMaterialGoodsReceiptReportRows = options => findGoodsReceiptReportRows({ ...options, type });
