import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editReason, getAllReasons, registerReason, removeReason } from '../../../controllers/api/warehouse/reasonController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { reasonValidation } from '../../../validators/forms/catalogValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.REASONS_READ),
    getAllReasons
);

router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), reasonValidation, validate, registerReason);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), reasonValidation, validate, editReason);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removeReason);

export default router;
