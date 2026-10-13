import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editWaste, editWasteStock, getAllWastes, getWasteMaterialTemplates, registerWaste, registerWasteStockAddition } from '../../../controllers/api/warehouse/wasteController.js';
import { wasteEditValidation, wasteStockAdditionValidation, wasteStockValidation, wasteValidation } from '../../../validators/forms/wasteValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { getWasteRollReference, updateWasteRollReference } from '../../../controllers/api/warehouse/wasteRollReferenceController.js';
import { wasteRollReferenceQueryValidation, wasteRollReferenceValidation } from '../../../validators/forms/wasteRollReferenceValidations.js';

const router = express.Router();

router.get('/roll-reference', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.WASTES_READ), wasteRollReferenceQueryValidation, validate, getWasteRollReference);
router.patch('/roll-reference', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.MATERIALS_WRITE), wasteRollReferenceValidation, validate, updateWasteRollReference);

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

router.post(
    '/:id/stock-additions',
    verifyApiTokenRequired,
    wasteStockAdditionValidation,
    validate,
    authorizeUserApi(PERMISSIONS.WASTES_ADD_STOCK),
    registerWasteStockAddition
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
