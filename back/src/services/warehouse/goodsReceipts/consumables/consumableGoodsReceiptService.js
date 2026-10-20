import { MATERIAL_TYPES } from '../../../../shared/constants/inventory.js';
import { cancelGoodsReceiptDetailLine } from '../detailChanges/goodsReceiptCancellationService.js';
import { correctGoodsReceiptDetailLine } from '../detailChanges/goodsReceiptCorrectionService.js';
import { createGoodsReceipt, findAllGoodsReceipts, updateGoodsReceipt } from '../goodsReceiptService.js';
import { findGoodsReceiptReportRows } from '../goodsReceiptReportService.js';

const type = MATERIAL_TYPES.CONSUMABLE;

export const findAllConsumableGoodsReceipts = options => findAllGoodsReceipts({ ...options, type });
export const createConsumableGoodsReceipt = options => createGoodsReceipt({ ...options, type });
export const updateConsumableGoodsReceipt = options => updateGoodsReceipt({ ...options, type });
export const correctConsumableGoodsReceiptDetailLine = options => correctGoodsReceiptDetailLine({ ...options, type });
export const cancelConsumableGoodsReceiptDetailLine = options => cancelGoodsReceiptDetailLine({ ...options, type });
export const findConsumableGoodsReceiptReportRows = options => findGoodsReceiptReportRows({ ...options, type });
