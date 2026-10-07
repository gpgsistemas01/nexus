import express from 'express';
import { getAllConsumableGoodsReceipts, registerConsumableGoodsReceipt, editConsumableGoodsReceipt, correctConsumableGoodsReceiptDetail, cancelConsumableGoodsReceiptDetail } from '../../../../../controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js';
import { goodsReceiptRouteMiddleware } from '../shared/goodsReceiptRouteMiddleware.js';

const router = express.Router();

router.get('/', ...goodsReceiptRouteMiddleware.list, getAllConsumableGoodsReceipts);
router.post('/', ...goodsReceiptRouteMiddleware.register, registerConsumableGoodsReceipt);
router.patch('/:id', ...goodsReceiptRouteMiddleware.edit, editConsumableGoodsReceipt);
router.patch('/:id/details/:detailId/corrections', ...goodsReceiptRouteMiddleware.correctDetail, correctConsumableGoodsReceiptDetail);
router.patch('/:id/details/:detailId/cancel', ...goodsReceiptRouteMiddleware.cancelDetail, cancelConsumableGoodsReceiptDetail);

export default router;
