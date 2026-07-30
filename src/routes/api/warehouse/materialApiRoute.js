import express from 'express';
import { authorizeInitialStockAdjustment, authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editMaterial, editMaterialStock, getAllMaterials, registerMaterial, removeMaterial } from '../../../controllers/api/warehouse/materialController.js';
import { materialCreateValidation, materialStockValidation, materialValidation } from '../../../validators/forms/materialValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();

const materialReadPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Asesor de ventas', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS', 'VENTAS Y PROYECTOS ESPECIALES']
};

const materialWritePermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

const materialStockWritePermissions = {
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
};

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(materialReadPermissions),
    getAllMaterials
);

router.post(
    '/',
    verifyApiTokenRequired,
    materialCreateValidation,
    validate,
    authorizeUserApi(materialWritePermissions),
    authorizeInitialStockAdjustment(materialStockWritePermissions),
    registerMaterial
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    materialValidation,
    validate,
    authorizeUserApi(materialWritePermissions),
    editMaterial
);


router.delete(
    '/:id',
    verifyApiTokenRequired,
    authorizeUserApi(materialWritePermissions),
    removeMaterial
);

router.patch(
    '/:id/stock',
    verifyApiTokenRequired,
    materialStockValidation,
    validate,
    authorizeUserApi(materialStockWritePermissions),
    editMaterialStock
);

export default router;
