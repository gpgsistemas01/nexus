import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { validate } from '../../../../../middleware/validatorMiddleware.js';
import {
    goodsIssueValidation,
    goodsIssueUpdateValidation,
    goodsIssueDetailsValidation
} from '../../../../../validators/forms/goodsIssueValidations.js';
import { issueHeaderValidation } from '../../../../../validators/forms/issueValidations.js';
import { issueReturnValidation } from '../../../../../validators/forms/issueReturnValidations.js';
import { PERMISSIONS } from '../../../../../shared/constants/permissions.js';

const manage = authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE);
const supply = authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);

export const goodsIssueRouteMiddleware = {
    list: [verifyApiTokenRequired, manage],
    register: [verifyApiTokenRequired, goodsIssueValidation, validate, manage],
    edit: [verifyApiTokenRequired, goodsIssueUpdateValidation, validate, manage],
    editHeader: [verifyApiTokenRequired, issueHeaderValidation, validate, manage],
    editDetails: [verifyApiTokenRequired, goodsIssueDetailsValidation, validate, supply],
    returnDetail: [verifyApiTokenRequired, issueReturnValidation, validate, supply]
};
