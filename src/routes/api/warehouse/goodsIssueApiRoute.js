import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    editGoodsIssue,
    editGoodsIssueDetails,
    editGoodsIssueHeader,
    getAllGoodsIssues,
    registerGoodsIssue,
    returnGoodsIssueDetail
} from '../../../controllers/api/warehouse/goodsIssueController.js';
import {
    goodsIssueDetailsValidation,
    goodsIssueHeaderValidation,
    goodsIssueReturnValidation,
    goodsIssueUpdateValidation,
    goodsIssueValidation
} from '../../../validators/forms/goodsIssueValidations.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();



router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE),
    getAllGoodsIssues
);

router.post(
    '/',
    verifyApiTokenRequired,
    goodsIssueValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE),
    registerGoodsIssue
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    goodsIssueUpdateValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE),
    editGoodsIssue
);

router.patch(
    '/:id/details',
    verifyApiTokenRequired,
    goodsIssueDetailsValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE),
    editGoodsIssueDetails
);

router.patch(
    '/:id/header',
    verifyApiTokenRequired,
    goodsIssueHeaderValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE),
    editGoodsIssueHeader
);

router.patch(
    '/:id/details/:detailId/returns',
    verifyApiTokenRequired,
    goodsIssueReturnValidation,
    validate,
    authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE),
    returnGoodsIssueDetail
);

export default router;
