import express from 'express';
import { getMaterialsPage } from '../../../controllers/web/warehouse/materialController.js';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.MATERIALS_READ),
    getMaterialsPage
);

export default router;
