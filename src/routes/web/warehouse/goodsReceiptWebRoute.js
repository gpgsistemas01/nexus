import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getGoodsReceiptsPage } from '../../../controllers/web/warehouse/goodsReceiptController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW),
    getGoodsReceiptsPage
);

export default router;
