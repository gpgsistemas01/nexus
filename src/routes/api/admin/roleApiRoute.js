import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllRoles } from '../../../controllers/api/admin/roleController.js';

const router = express.Router();

const roleReadPermissions = {
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Almacenista'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(roleReadPermissions),
    getAllRoles
);

export default router;
