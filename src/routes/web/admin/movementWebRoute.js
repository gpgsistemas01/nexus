import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getMovementPage } from '../../../controllers/web/admin/movementController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.MOVEMENTS_READ),
    getMovementPage
);

export default router;
