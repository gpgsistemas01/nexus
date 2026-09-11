import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { editDepartment, getAllDepartments, registerDepartment, removeDepartment } from '../../../controllers/api/admin/departmentController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { namedCatalogValidation } from '../../../validators/forms/catalogValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();

router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.DEPARTMENTS_READ),
    getAllDepartments
);

router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, registerDepartment);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, editDepartment);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removeDepartment);

export default router;
