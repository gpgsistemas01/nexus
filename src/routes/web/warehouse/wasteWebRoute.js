import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getWastesPage } from '../../../controllers/web/warehouse/wasteController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/', 
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.WASTES_PAGE_VIEW),
    getWastesPage
);

export default router;
