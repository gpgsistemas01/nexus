import express from 'express';
import {
    editWasteIssue,
    editWasteIssueHeader,
    editWasteIssueDetails,
    getAllWasteIssues,
    registerWasteIssue,
    returnWasteIssueDetail
} from '../../../controllers/api/warehouse/wasteIssueController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    wasteIssueDetailsValidation,
    wasteIssueHeaderValidation,
    wasteIssueUpdateValidation,
    wasteIssueValidation
} from '../../../validators/forms/wasteIssueValidations.js';
import { issueReturnValidation } from '../../../validators/forms/issueReturnValidations.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE),
    getAllWasteIssues
);

router.post(
    '/',
    verifyApiTokenRequired,
    wasteIssueValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE),
    registerWasteIssue
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    wasteIssueUpdateValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE),
    editWasteIssue
);

router.patch(
    '/:id/header',
    verifyApiTokenRequired,
    wasteIssueHeaderValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE),
    editWasteIssueHeader
);

router.patch(
    '/:id/details',
    verifyApiTokenRequired,
    wasteIssueDetailsValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY),
    editWasteIssueDetails
);

router.patch(
    '/:id/details/:detailId/returns',
    verifyApiTokenRequired,
    issueReturnValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY),
    returnWasteIssueDetail
);

export default router;
