import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getSuppliers } from '../../../controllers/web/warehouse/supplierController.js';

const router = express.Router();

const supplierPagePermissions = {
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(supplierPagePermissions),
    getSuppliers
);

export default router;
