import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    cancelConsumableGoodsReceiptDetail,
    cancelMaterialGoodsReceiptDetail,
    correctConsumableGoodsReceiptDetail,
    correctMaterialGoodsReceiptDetail,
    editConsumableGoodsReceipt,
    editMaterialGoodsReceipt,
    getAllConsumableGoodsReceipts,
    getAllMaterialGoodsReceipts,
    registerConsumableGoodsReceipt,
    registerMaterialGoodsReceipt
} from '../../../controllers/api/warehouse/goodsReceiptController.js';
import { goodsReceiptCorrectionValidation, goodsReceiptHeaderValidation, goodsReceiptValidation } from '../../../validators/forms/goodsReceiptValidations.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();
const canManageGoodsReceipts = authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE);

router.get(
    '/materials',
    verifyApiTokenRequired,
    canManageGoodsReceipts,
    getAllMaterialGoodsReceipts
);

router.post(
    '/materials',
    verifyApiTokenRequired,
    goodsReceiptValidation,
    validate,
    canManageGoodsReceipts,
    registerMaterialGoodsReceipt
);

router.patch(
    '/materials/:id',
    verifyApiTokenRequired,
    goodsReceiptHeaderValidation,
    validate,
    canManageGoodsReceipts,
    editMaterialGoodsReceipt
);

router.patch(
    '/materials/:id/details/:detailId/corrections',
    verifyApiTokenRequired,
    goodsReceiptCorrectionValidation,
    validate,
    canManageGoodsReceipts,
    correctMaterialGoodsReceiptDetail
);

router.patch(
    '/materials/:id/details/:detailId/cancel',
    verifyApiTokenRequired,
    canManageGoodsReceipts,
    cancelMaterialGoodsReceiptDetail
);

router.get(
    '/consumables',
    verifyApiTokenRequired,
    canManageGoodsReceipts,
    getAllConsumableGoodsReceipts
);

router.post(
    '/consumables',
    verifyApiTokenRequired,
    goodsReceiptValidation,
    validate,
    canManageGoodsReceipts,
    registerConsumableGoodsReceipt
);

router.patch(
    '/consumables/:id',
    verifyApiTokenRequired,
    goodsReceiptHeaderValidation,
    validate,
    canManageGoodsReceipts,
    editConsumableGoodsReceipt
);

router.patch(
    '/consumables/:id/details/:detailId/corrections',
    verifyApiTokenRequired,
    goodsReceiptCorrectionValidation,
    validate,
    canManageGoodsReceipts,
    correctConsumableGoodsReceiptDetail
);

router.patch(
    '/consumables/:id/details/:detailId/cancel',
    verifyApiTokenRequired,
    canManageGoodsReceipts,
    cancelConsumableGoodsReceiptDetail
);

export default router;
