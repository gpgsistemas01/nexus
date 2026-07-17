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

const router = express.Router();
const goodsReceiptPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(goodsReceiptPermissions),
    getAllGoodsReceipts
);

router.post(
    '/',
    verifyApiTokenRequired,
    goodsReceiptValidation,
    validate,
    authorizeUserApi(goodsReceiptPermissions),
    registerGoodsReceipt
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    goodsReceiptHeaderValidation,
    validate,
    authorizeUserApi(goodsReceiptPermissions),
    editGoodsReceiptHeader
);


router.patch(
    '/:id/details/:detailId/corrections',
    verifyApiTokenRequired,
    goodsReceiptCorrectionValidation,
    validate,
    authorizeUserApi(goodsReceiptPermissions),
    correctGoodsReceiptDetail
);

router.patch(
    '/:id/details/:detailId/cancel',
    verifyApiTokenRequired,
    authorizeUserApi(goodsReceiptPermissions),
    cancelGoodsReceiptDetail
);

export default router;
