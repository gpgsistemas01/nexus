import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { editUnitMeasure, getAllUnitMeasures, registerUnitMeasure, removeUnitMeasure } from '../../../controllers/api/warehouse/unitMeasureController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { unitMeasureValidation } from '../../../validators/forms/catalogValidations.js';
import { validate } from '../../../middleware/validatorMiddleware.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.UNIT_MEASURES_READ),
    getAllUnitMeasures
);

router.post('/', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), unitMeasureValidation, validate, registerUnitMeasure);
router.put('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), unitMeasureValidation, validate, editUnitMeasure);
router.delete('/:id', verifyApiTokenRequired, authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE), removeUnitMeasure);

export default router;
