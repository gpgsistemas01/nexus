import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from "../../../middleware/authMiddleware.js";
import { exportMovementReport, exportProfileReport, exportUserReport } from '../../../controllers/api/admin/reportController.js';

const router = express.Router();
const reportPermissions = {
    roles: ['Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['SISTEMAS']
};

router.get(
    '/movements/excel', 
    verifyApiTokenRequired, 
    authorizeUserApi(reportPermissions), 
    exportMovementReport
);

router.get(
    '/users/excel',
    verifyApiTokenRequired,
    authorizeUserApi(reportPermissions),
    exportUserReport
);

router.get(
    '/profiles/excel',
    verifyApiTokenRequired,
    authorizeUserApi(reportPermissions),
    exportProfileReport
);

export default router;
