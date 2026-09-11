import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editPresentation, getAllPresentations, registerPresentation, removePresentation } from '../../../controllers/api/warehouse/presentationController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { namedCatalogValidation } from '../../../validators/forms/catalogValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PRESENTATIONS_READ),
    getAllPresentations
);

router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, registerPresentation);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), namedCatalogValidation(50), validate, editPresentation);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removePresentation);

export default router;
