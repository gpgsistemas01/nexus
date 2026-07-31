import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getPurchaseRequisitionsPage } from '../../../controllers/web/warehouse/purchaseRequisitionController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.PURCHASE_REQUISITIONS_PAGE_VIEW),
    getPurchaseRequisitionsPage
);

export default router;
