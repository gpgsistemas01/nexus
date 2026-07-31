import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { getAllUnitMeasures } from '../../../controllers/api/warehouse/unitMeasureController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.UNIT_MEASURES_READ),
    getAllUnitMeasures
);

export default router;
