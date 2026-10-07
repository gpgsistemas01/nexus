import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { validate } from '../../../../../middleware/validatorMiddleware.js';
import { goodsIssueValidation, goodsIssueUpdateValidation, goodsIssueHeaderValidation, goodsIssueDetailsValidation, goodsIssueReturnValidation } from '../../../../../validators/forms/goodsIssueValidations.js';
import { PERMISSIONS } from '../../../../../constants/permissions.js';

const manage = authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE);
const supply = authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);

export const goodsIssueRouteMiddleware = {
    list: [verifyApiTokenRequired, manage],
    register: [verifyApiTokenRequired, goodsIssueValidation, validate, manage],
    edit: [verifyApiTokenRequired, goodsIssueUpdateValidation, validate, manage],
    editHeader: [verifyApiTokenRequired, goodsIssueHeaderValidation, validate, manage],
    editDetails: [verifyApiTokenRequired, goodsIssueDetailsValidation, validate, supply],
    returnDetail: [verifyApiTokenRequired, goodsIssueReturnValidation, validate, supply]
};
