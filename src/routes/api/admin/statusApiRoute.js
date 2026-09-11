import express from 'express';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { editStatus, getAllStatuses, registerStatus, removeStatus } from '../../../controllers/api/admin/statusController.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { namedCatalogValidation } from '../../../validators/forms/catalogValidations.js';

const router = express.Router();

router.get('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.STATUSES_READ), getAllStatuses);
router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, registerStatus);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, editStatus);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removeStatus);

export default router;
