import { INVENTORY_IMPORT_MODES } from '../../../shared/constants/inventoryImport.js';
import { Router } from 'express';
import { verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { authorizeInventoryImport } from '../../../services/warehouse/imports/inventoryImportConfig.js';
import { validateRecordVersion } from '../../../validators/fields/versionValidator.js';
import { validateUUID } from '../../../validators/fields/fieldsValidator.js';
import { validate } from '../../../middleware/validatorMiddleware.js';
import { getInventoryImportTemplate, prepareInventoryImport, applyInventoryImport,
    readInventoryImport, discardInventoryImport, exportInventoryImportErrors } from '../../../controllers/api/warehouse/inventoryImportController.js';

const router = Router();
router.use(verifyApiTokenRequired);
const authorizeUpload = (req, _res, next) => {
    authorizeInventoryImport(req.user, req.params.resource, req.query.mode ?? INVENTORY_IMPORT_MODES.CREATE);
    next();
};
router.get('/:resource/template', authorizeUpload, getInventoryImportTemplate);
router.post('/:resource/preview', authorizeUpload, prepareInventoryImport);
router.post('/:id/confirm', validateRecordVersion(), validateUUID('operationId'), validate, applyInventoryImport);
router.get('/:id', readInventoryImport);
router.delete('/:id', discardInventoryImport);
router.get('/:id/errors/excel', exportInventoryImportErrors);

export default router;
