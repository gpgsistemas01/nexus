import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getMaterialMovementPage, getWasteMovementPage } from '../../../controllers/web/admin/movementController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/materiales',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.MOVEMENTS_READ),
    getMaterialMovementPage
);

router.get(
    '/mermas',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(PERMISSIONS.MOVEMENTS_READ),
    getWasteMovementPage
);

router.get('/', (req, res) => res.redirect(308, '/movimientos/materiales'));

export default router;
