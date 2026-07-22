import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { exportGoodsIssueReportExcel, exportGoodsReceiptReportExcel, exportSupplierReportExcel, exportWarehouseReportExcel, exportWasteReportExcel } from '../../../controllers/api/warehouse/reportController.js';

const router = express.Router();

const reportPermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};

const supplierReportPermissions = {
    roles: ['Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['SISTEMAS']
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

router.get(
    '/goods-receipts/excel',
    verifyApiTokenRequired,
    authorizeUserApi(reportPermissions),
    exportGoodsReceiptReportExcel
);

router.get(
    '/wastes/excel',
    verifyApiTokenRequired,
    authorizeUserApi(reportPermissions),
    exportWasteReportExcel
);

router.get(
    '/suppliers/excel',
    verifyApiTokenRequired,
    authorizeUserApi(supplierReportPermissions),
    exportSupplierReportExcel
);

export default router;
