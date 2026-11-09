import { Router } from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { historicalDeliveryValidation } from '../../../validators/forms/historicalDeliveryValidations.js';
import { previewHistoricalDeliveryBatch, confirmHistoricalDeliveryBatch } from '../../../controllers/api/warehouse/historicalDeliveryController.js';

const router = Router();
router.use(verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.ISSUES_RECONCILE));
router.get('/:resource/preview', previewHistoricalDeliveryBatch);
router.post('/:resource/confirm', historicalDeliveryValidation, validate, confirmHistoricalDeliveryBatch);
export default router;
