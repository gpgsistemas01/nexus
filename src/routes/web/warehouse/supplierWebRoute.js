import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getSuppliersPage } from '../../../controllers/web/warehouse/supplierController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.SUPPLIERS_PAGE_VIEW),
    getSuppliersPage
);

export default router;
