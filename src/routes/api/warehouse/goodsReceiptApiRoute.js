import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    editGoodsReceiptHeader,
    getAllGoodsReceipts,
    registerGoodsReceipt,
    returnGoodsReceipt,
    correctGoodsReceiptDetail
} from '../../../controllers/api/warehouse/goodsReceiptController.js';
import { goodsReceiptCorrectionValidation, goodsReceiptHeaderValidation, goodsReceiptReturnValidation, goodsReceiptValidation } from '../../../validators/forms/goodsReceiptValidations.js';

const router = express.Router();
const goodsReceiptPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};
const goodsReceiptReturnPermissions = {
    roles: ['Almacenista', 'Auxiliar', 'Coordinador', 'Administrador del sistema'],
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
    '/:id/returns',
    verifyApiTokenRequired,
    goodsReceiptReturnValidation,
    validate,
    authorizeUserApi(goodsReceiptReturnPermissions),
    returnGoodsReceipt
);

export default router;
