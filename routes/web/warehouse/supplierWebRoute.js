import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getSuppliers } from '../../../controllers/web/warehouse/supplierController.js';

const router = express.Router();

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    getSuppliers
);

export default router;