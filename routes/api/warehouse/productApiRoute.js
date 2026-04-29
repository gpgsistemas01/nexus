import express from 'express';
import { authorizeUserApi, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { editProduct, getAllProducts, registerProduct } from '../../../controllers/api/warehouse/productController.js';
import { productValidation } from '../../../validators/forms/productValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();

const productPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserApi(productPermissions),
    getAllProducts
);

router.post(
    '/',
    verifyCookiesAuthTokenRequired,
    productValidation,
    validate,
    authorizeUserApi(productPermissions),
    registerProduct
);

router.put(
    '/:id',
    verifyCookiesAuthTokenRequired,
    productValidation,
    validate,
    authorizeUserApi(productPermissions),
    editProduct
);

export default router;
