import express from 'express';
import { getConsumablesPage } from '../../../controllers/web/warehouse/consumableController.js';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.MATERIALS_READ),
    getConsumablesPage
);

export default router;
