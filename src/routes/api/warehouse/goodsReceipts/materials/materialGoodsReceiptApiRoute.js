import express from 'express';
import { getAllMaterialGoodsReceipts, registerMaterialGoodsReceipt, editMaterialGoodsReceipt, correctMaterialGoodsReceiptDetail, cancelMaterialGoodsReceiptDetail } from '../../../../../controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js';
import { goodsReceiptRouteMiddleware } from '../shared/goodsReceiptRouteMiddleware.js';

const router = express.Router();

router.get('/', ...goodsReceiptRouteMiddleware.list, getAllMaterialGoodsReceipts);
router.post('/', ...goodsReceiptRouteMiddleware.register, registerMaterialGoodsReceipt);
router.patch('/:id', ...goodsReceiptRouteMiddleware.edit, editMaterialGoodsReceipt);
router.patch('/:id/details/:detailId/corrections', ...goodsReceiptRouteMiddleware.correctDetail, correctMaterialGoodsReceiptDetail);
router.patch('/:id/details/:detailId/cancel', ...goodsReceiptRouteMiddleware.cancelDetail, cancelMaterialGoodsReceiptDetail);

export default router;
