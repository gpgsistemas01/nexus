import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editWaste, editWasteStock, getAllWastes, registerWaste } from '../../../controllers/api/warehouse/wasteController.js';
import { wasteStockValidation, wasteUpdateValidation, wasteValidation } from '../../../validators/forms/wasteValidations.js';
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

const wasteStockWritePermissions = {
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
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

router.patch(
    '/:id',
    verifyApiTokenRequired,
    wasteUpdateValidation,
    validate,
    authorizeUserApi(wasteWritePermissions),
    editWaste
);

router.patch(
    '/:id/stock',
    verifyApiTokenRequired,
    wasteStockValidation,
    validate,
    authorizeUserApi(wasteStockWritePermissions),
    editWasteStock
);

export default router;
