import express from 'express';
import { authorizeUserApi, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { editSupplier, getAllSuppliers, registerSupplier } from '../../../controllers/api/warehouse/supplierController.js';
import { supplierValidation } from '../../../validators/forms/supplierValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();
const supplierPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserApi(supplierPermissions),
    getAllSuppliers
);

router.post(
    '/',
    verifyCookiesAuthTokenRequired,
    supplierValidation,
    validate,
    authorizeUserApi(supplierPermissions),
    registerSupplier
);

router.put(
    '/:id',
    verifyCookiesAuthTokenRequired,
    supplierValidation,
    validate,
    authorizeUserApi(supplierPermissions),
    editSupplier
);

export default router;
