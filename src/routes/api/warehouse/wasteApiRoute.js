import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editWaste, editWasteStock, getAllWastes, getWasteMaterialTemplates, registerWaste } from '../../../controllers/api/warehouse/wasteController.js';
import { wasteEditValidation, wasteStockValidation, wasteValidation } from '../../../validators/forms/wasteValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/material-templates',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WASTES_READ),
    getWasteMaterialTemplates
);

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WASTES_READ),
    getAllWastes
);

router.post(
    '/',
    verifyApiTokenRequired,
    wasteValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTES_WRITE),
    registerWaste
);

router.patch(
    '/:id',
    verifyApiTokenRequired,
    wasteEditValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTES_WRITE),
    editWaste
);

router.patch(
    '/:id/stock',
    verifyApiTokenRequired,
    wasteStockValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTES_ADJUST_STOCK),
    editWasteStock
);

export default router;
