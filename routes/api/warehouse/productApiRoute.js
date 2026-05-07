import express from 'express';
import { authorizeUserApi, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { editProduct, getAllProducts, registerProduct } from '../../../controllers/api/warehouse/productController.js';
import { productValidation } from '../../../validators/forms/productValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();

const productReadPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Vendedor', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS', 'VENTAS Y PROYECTOS ESPECIALES']
};

const productWritePermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserApi(productReadPermissions),
    getAllProducts
);

router.post(
    '/',
    verifyCookiesAuthTokenRequired,
    productValidation,
    validate,
    authorizeUserApi(productWritePermissions),
    registerProduct
);

router.put(
    '/:id',
    verifyCookiesAuthTokenRequired,
    productValidation,
    validate,
    authorizeUserApi(productWritePermissions),
    editProduct
);

export default router;
