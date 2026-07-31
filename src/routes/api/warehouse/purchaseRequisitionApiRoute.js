import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    cancelPurchaseRequisitionStatus,
    confirmPurchaseRequisitionStatus,
    editPurchaseRequisition,
    getAllPurchaseRequisitions,
    registerPurchaseRequisition
} from '../../../controllers/api/warehouse/purchaseRequisitionController.js';
import { purchaseRequisitionValidation } from '../../../validators/forms/purchaseRequisitionValidations.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();



router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PURCHASE_REQUISITIONS_MANAGE),
    getAllPurchaseRequisitions
);

router.post(
    '/',
    verifyApiTokenRequired,
    purchaseRequisitionValidation,
    validate,
    authorizeUserApi(PERMISSIONS.PURCHASE_REQUISITIONS_MANAGE),
    registerPurchaseRequisition
);

router.put(
    '/:id',
    verifyApiTokenRequired,
    purchaseRequisitionValidation,
    validate,
    authorizeUserApi(PERMISSIONS.PURCHASE_REQUISITIONS_MANAGE),
    editPurchaseRequisition
);

router.patch(
    '/:id/confirm',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PURCHASE_REQUISITIONS_STATUS_MANAGE),
    confirmPurchaseRequisitionStatus
);

router.patch(
    '/:id/cancel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PURCHASE_REQUISITIONS_STATUS_MANAGE),
    cancelPurchaseRequisitionStatus
);

export default router;
