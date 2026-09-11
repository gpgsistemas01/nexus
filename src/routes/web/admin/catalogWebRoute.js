import express from 'express';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { getCatalogPage } from '../../../controllers/web/admin/catalogController.js';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.get(
    '/:catalog',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.CATALOGS_PAGE_VIEW),
    getCatalogPage
);

export default router;
