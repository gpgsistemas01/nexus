import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editSupplier, getAllSuppliers, registerSupplier } from '../../../controllers/api/warehouse/supplierController.js';
import { supplierValidation } from '../../../validators/forms/supplierValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.SUPPLIERS_MANAGE),
    getAllSuppliers
);

router.post(
    '/',
    verifyApiTokenRequired,
    supplierValidation,
    validate,
    authorizeUserApi(PERMISSIONS.SUPPLIERS_MANAGE),
    registerSupplier
);

router.put(
    '/:id',
    verifyApiTokenRequired,
    supplierValidation,
    validate,
    authorizeUserApi(PERMISSIONS.SUPPLIERS_UPDATE),
    editSupplier
);

export default router;
