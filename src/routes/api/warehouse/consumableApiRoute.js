import express from 'express';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { editConsumable, editConsumableStock, getAllConsumables, registerConsumable, removeConsumable } from '../../../controllers/api/warehouse/consumableController.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { materialEditValidation, materialStockValidation, materialValidation } from '../../../validators/forms/materialValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MATERIALS_READ),
    getAllConsumables
);

router.post(
    '/',
    verifyApiTokenRequired,
    materialValidation,
    validate,
    authorizeUserApi(PERMISSIONS.MATERIALS_WRITE),
    registerConsumable
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    materialEditValidation,
    validate,
    authorizeUserApi(PERMISSIONS.MATERIALS_WRITE),
    editConsumable
);

router.patch(
    '/:id/stock',
    verifyApiTokenRequired,
    materialStockValidation,
    validate,
    authorizeUserApi(PERMISSIONS.MATERIALS_ADJUST_STOCK),
    editConsumableStock
);

router.delete(
    '/:id',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.MATERIALS_WRITE),
    removeConsumable
);

export default router;
