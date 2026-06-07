import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllWastes, registerWaste } from '../../../controllers/api/warehouse/wasteController.js';
import { wasteValidation } from '../../../validators/forms/wasteValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();

const wasteReadPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Vendedor', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS', 'VENTAS Y PROYECTOS ESPECIALES']
};

const wasteWritePermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(wasteReadPermissions),
    getAllWastes
);

router.post(
    '/',
    verifyApiTokenRequired,
    wasteValidation,
    validate,
    authorizeUserApi(wasteWritePermissions),
    registerWaste
);

export default router;
