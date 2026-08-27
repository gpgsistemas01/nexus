import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { exportMovementReport, exportPersonReport, exportUserReport, exportWasteMovementReport } from '../../../controllers/api/admin/reportController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();


router.get(
    '/movements/materials/excel',
    verifyApiTokenRequired, 
    authorizeUserApi(PERMISSIONS.ADMIN_REPORTS_READ),
    exportMovementReport
);

router.get(
    '/movements/wastes/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.ADMIN_REPORTS_READ),
    exportWasteMovementReport
);

router.get(
    '/users/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.ADMIN_REPORTS_READ),
    exportUserReport
);

router.get(
    ['/persons/excel', '/profiles/excel'],
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.PERSON_REPORTS_READ),
    exportPersonReport
);

export default router;
