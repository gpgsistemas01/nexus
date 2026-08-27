import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getWasteIssuesPage } from '../../../controllers/web/warehouse/wasteIssueController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.WASTE_ISSUES_PAGE_VIEW),
    getWasteIssuesPage
);

export default router;
