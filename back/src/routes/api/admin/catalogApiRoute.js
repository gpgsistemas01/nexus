import express from 'express';
import {
    editCatalogEntry,
    getAllCatalogEntries,
    registerCatalogEntry,
    removeMaterialCatalogEntry
} from '../../../controllers/api/admin/catalogController.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { catalogEntryEditValidation, catalogEntryValidation } from '../../../validators/forms/catalogValidations.js';

const router = express.Router();

router.use(verifyApiTokenRequired);
router.use('/:catalog', (req, res, next) => authorizeUserApi(
    req.user.permissions.includes(PERMISSIONS.CATALOGS_MANAGE) ? PERMISSIONS.CATALOGS_MANAGE
        : req.params.catalog === 'materials' || (req.method === 'GET' && ['presentations', 'unit-measures'].includes(req.params.catalog))
            ? PERMISSIONS.MATERIAL_CATALOGS_MANAGE : PERMISSIONS.CATALOGS_MANAGE
)(req, res, next));

router.get(
    '/:catalog',
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

router.delete('/materials/:id', removeMaterialCatalogEntry);

export default router;
