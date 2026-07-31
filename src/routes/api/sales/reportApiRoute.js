import express from 'express';
import { exportClientReport } from '../../../controllers/api/sales/reportController.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();

router.get(
    '/clients/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.CLIENT_REPORTS_READ),
    exportClientReport
);

export default router;
