import express from 'express';
import { authorizeInitialStockAdjustment, authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editMaterial, editMaterialStock, getAllMaterials, registerMaterial, removeMaterial } from '../../../controllers/api/warehouse/materialController.js';
import { materialCreateValidation, materialStockValidation, materialValidation } from '../../../validators/forms/materialValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MATERIALS_READ),
    getAllMaterials
);

router.post(
    '/',
    verifyApiTokenRequired,
    materialCreateValidation,
    validate,
    authorizeUserApi(PERMISSIONS.MATERIALS_WRITE),
    authorizeInitialStockAdjustment(PERMISSIONS.MATERIALS_ADJUST_STOCK),
    registerMaterial
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    materialValidation,
    validate,
    authorizeUserApi(PERMISSIONS.MATERIALS_WRITE),
    editMaterial
);


router.delete(
    '/:id',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MATERIALS_WRITE),
    removeMaterial
);

router.patch(
    '/:id/stock',
    verifyApiTokenRequired,
    materialStockValidation,
    validate,
    authorizeUserApi(PERMISSIONS.MATERIALS_ADJUST_STOCK),
    editMaterialStock
);

export default router;
