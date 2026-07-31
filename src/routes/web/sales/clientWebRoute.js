import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getClientPage } from '../../../controllers/web/sales/clientController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.CLIENTS_PAGE_VIEW),
    getClientPage
);

export default router;
