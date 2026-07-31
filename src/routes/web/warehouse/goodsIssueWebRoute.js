import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getGoodsIssuesPage } from '../../../controllers/web/warehouse/goodsIssueController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.GOODS_ISSUES_PAGE_VIEW),
    getGoodsIssuesPage
);

export default router;
