import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { exportGoodsIssueReportExcel, exportWarehouseReportExcel } from '../../../controllers/api/warehouse/reportController.js';

const router = express.Router();

const reportPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

router.get(
    '/inventory/excel', 
    verifyApiTokenRequired, 
    authorizeUserApi(reportPermissions), 
    exportWarehouseReportExcel
);

router.get(
    '/goods-issues/excel',
    verifyApiTokenRequired,
    authorizeUserApi(reportPermissions),
    exportGoodsIssueReportExcel
);

export default router;
