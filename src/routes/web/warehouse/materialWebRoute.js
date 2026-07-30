import express from 'express';
import { getMaterialsPage } from '../../../controllers/web/warehouse/materialController.js';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';

const router = express.Router();

const materialPagePermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Asesor de ventas', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS', 'VENTAS Y PROYECTOS ESPECIALES']
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb(materialPagePermissions),
    getMaterialsPage
);

export default router;
