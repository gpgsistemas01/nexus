import express from 'express';
import {
    editCatalogEntry,
    getAllCatalogEntries,
    registerCatalogEntry
} from '../../../controllers/api/admin/catalogController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import {
    catalogEntryEditValidation,
    catalogEntryValidation,
    catalogNameValidation
} from '../../../validators/forms/catalogValidations.js';

const router = express.Router();

router.use(verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE));

router.get(
    '/:catalog',
    catalogNameValidation,
    validate,
    getAllCatalogEntries
);

router.post(
    '/:catalog',
    catalogEntryValidation,
    validate,
    registerCatalogEntry
);

router.put(
    '/:catalog/:id',
    catalogEntryEditValidation,
    validate,
    editCatalogEntry
);

export default router;
