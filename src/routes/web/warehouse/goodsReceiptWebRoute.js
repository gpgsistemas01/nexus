import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getConsumableGoodsReceiptsPage, getMaterialGoodsReceiptsPage } from '../../../controllers/web/warehouse/goodsReceiptController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();
const goodsReceiptPageMiddleware = [
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW)
];

router.get(
    '/',
    ...goodsReceiptPageMiddleware,
    (req, res) => res.redirect(308, '/compras/materiales')
);

router.get(
    '/materiales',
    ...goodsReceiptPageMiddleware,
    getMaterialGoodsReceiptsPage
);

router.get(
    '/consumibles',
    ...goodsReceiptPageMiddleware,
    getConsumableGoodsReceiptsPage
);

export default router;
