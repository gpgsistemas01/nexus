import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { validate } from '../../../../../middleware/validatorMiddleware.js';
import { goodsReceiptCorrectionValidation, goodsReceiptHeaderValidation, goodsReceiptValidation } from '../../../../../validators/forms/goodsReceiptValidations.js';
import { PERMISSIONS } from '../../../../../constants/permissions.js';

const manage = authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE);
export const goodsReceiptRouteMiddleware = {
    list: [verifyApiTokenRequired, manage],
    register: [verifyApiTokenRequired, goodsReceiptValidation, validate, manage],
    edit: [verifyApiTokenRequired, goodsReceiptHeaderValidation, validate, manage],
    correctDetail: [verifyApiTokenRequired, goodsReceiptCorrectionValidation, validate, manage],
    cancelDetail: [verifyApiTokenRequired, manage]
};
