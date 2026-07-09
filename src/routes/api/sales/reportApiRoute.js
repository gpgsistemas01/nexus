import express from 'express';
import { exportClientReport } from '../../../controllers/api/sales/reportController.js';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';

const router = express.Router();
const reportPermissions = {
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar'],
    departments: ['SISTEMAS']
};

router.get(
    '/clients/excel',
    verifyApiTokenRequired,
    authorizeUserApi(reportPermissions),
    exportClientReport
);

export default router;
