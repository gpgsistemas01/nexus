import express from 'express';
import { getAllProfiles } from "../../../controllers/api/admin/profileController.js";
import { authorizeUserApi, verifyCookiesAuthTokenRequired } from "../../../middleware/authMiddleware.js";

const router = express.Router();
const profilePermissions = {
    roles: [ 'Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Diseñador', 'Almacenista', 'Vendedor', 'Repartidor' ],
    departments: [
        'DIRECCIÓN',
        'ACABADOS',
        'ADMINISTRATIVO',
        'ALMACÉN Y PROVEDURÍA',
        'DISEÑO',
        'INSTALACIONES',
        'IMPRESIÓN',
        'ROUTER',
        'PT/TRÁFICO',
        'SISTEMAS',
        'TALLER 3D',
        'VENTAS Y PROYECTOS ESPECIALES'
    ]
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserApi(profilePermissions),
    getAllProfiles
);

export default router;
