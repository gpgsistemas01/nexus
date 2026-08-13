import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { exportGoodsIssueReportExcel, exportGoodsReceiptReportExcel, exportSupplierReportExcel, exportWarehouseReportExcel, exportWasteIssueReportExcel, exportWasteReportExcel } from '../../../controllers/api/warehouse/reportController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';

const router = express.Router();



router.get(
    '/inventory/excel', 
    verifyApiTokenRequired, 
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportWarehouseReportExcel
);

router.get(
    '/goods-issues/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportGoodsIssueReportExcel
);

router.get(
    '/goods-receipts/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportGoodsReceiptReportExcel
);

router.get(
    '/waste-issues/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportWasteIssueReportExcel
);

router.get(
    '/wastes/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportWasteReportExcel
);

router.get(
    '/suppliers/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.SUPPLIER_REPORTS_READ),
    exportSupplierReportExcel
);

export default router;
