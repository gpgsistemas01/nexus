import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { exportMovementReport, exportProfileReport, exportUserReport } from '../../../controllers/api/admin/reportController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/movements/excel', 
    verifyApiTokenRequired, 
    authorizeUserApi(PERMISSIONS.ADMIN_REPORTS_READ),
    exportMovementReport
);

router.get(
    '/users/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.ADMIN_REPORTS_READ),
    exportUserReport
);

router.get(
    '/profiles/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PROFILE_REPORTS_READ),
    exportProfileReport
);

export default router;
