import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getPurchaseRequisitionsPage } from '../../../controllers/web/warehouse/purchaseRequisitionController.js';

const router = express.Router();

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    getPurchaseRequisitionsPage
);

export default router;