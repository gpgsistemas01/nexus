import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    editGoodsReceiptHeader,
    getAllGoodsReceipts,
    registerGoodsReceipt,
    correctGoodsReceiptDetail,
    cancelGoodsReceiptDetail
} from '../../../controllers/api/warehouse/goodsReceiptController.js';
import { goodsReceiptCorrectionValidation, goodsReceiptHeaderValidation, goodsReceiptValidation } from '../../../validators/forms/goodsReceiptValidations.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE),
    getAllGoodsReceipts
);

router.post(
    '/',
    verifyApiTokenRequired,
    goodsReceiptValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE),
    registerGoodsReceipt
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    goodsReceiptHeaderValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE),
    editGoodsReceiptHeader
);


router.patch(
    '/:id/details/:detailId/corrections',
    verifyApiTokenRequired,
    goodsReceiptCorrectionValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE),
    correctGoodsReceiptDetail
);

router.patch(
    '/:id/details/:detailId/cancel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE),
    cancelGoodsReceiptDetail
);

export default router;
