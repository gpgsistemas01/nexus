import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editRole, getAllRoles, registerRole, removeRole } from '../../../controllers/api/admin/roleController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { namedCatalogValidation } from '../../../validators/forms/catalogValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.ROLES_READ),
    getAllRoles
);

router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, registerRole);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, editRole);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removeRole);

export default router;
