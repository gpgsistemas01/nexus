import express from 'express';
import { authorizeUserApi, verifyCookiesAuthTokenRequired } from "../../../middleware/authMiddleware.js";
import { getAllDepartments } from '../../../controllers/api/admin/departmentController.js';

const router = express.Router();
const profilePermissions = {
    roles: [ 'Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Diseñador', 'Almacenista', 'Vendedor', 'Repartidor' ],
    departments: [ 'Sistemas', 'Ventas', 'Diseño', 'Impresión', 'Router', 'Taller 3d', 'Herrería', 'Acabados', 'PT', 'Tráfico', 'Instalaciones', 'Almacén' ]
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserApi(profilePermissions),
    getAllDepartments
);

export default router;