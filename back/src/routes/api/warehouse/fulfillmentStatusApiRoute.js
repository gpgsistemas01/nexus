import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllFulfillmentStatuses } from '../../../controllers/api/warehouse/fulfillmentStatusController.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.FULFILLMENT_STATUSES_READ),
    getAllFulfillmentStatuses
);

export default router;
