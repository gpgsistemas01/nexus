import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editFulfillmentStatus, getAllFulfillmentStatuses, registerFulfillmentStatus, removeFulfillmentStatus } from '../../../controllers/api/warehouse/fulfillmentStatusController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { namedCatalogValidation } from '../../../validators/forms/catalogValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.FULFILLMENT_STATUSES_READ),
    getAllFulfillmentStatuses
);

router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, registerFulfillmentStatus);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, editFulfillmentStatus);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removeFulfillmentStatus);

export default router;
