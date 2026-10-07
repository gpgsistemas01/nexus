import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../../middleware/authMiddleware.js';
import { getConsumableGoodsIssuesPage, getMaterialGoodsIssuesPage } from '../../../../controllers/web/warehouse/goodsIssues/goodsIssueController.js';
import { PERMISSIONS } from '../../../../constants/permissions.js';

const router = express.Router();
const goodsIssuePageMiddleware = [
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.GOODS_ISSUES_PAGE_VIEW)
];

router.get(
    '/',
    ...goodsIssuePageMiddleware,
    (req, res) => res.redirect(308, '/salidas/materiales')
);

router.get(
    '/materiales',
    ...goodsIssuePageMiddleware,
    getMaterialGoodsIssuesPage
);

router.get(
    '/consumibles',
    ...goodsIssuePageMiddleware,
    getConsumableGoodsIssuesPage
);

export default router;
