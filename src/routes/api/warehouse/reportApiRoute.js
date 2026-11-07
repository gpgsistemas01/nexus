import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../middleware/authMiddleware.js';
import { exportConsumableGoodsReceiptReportExcel, exportGoodsIssueReportExcel, exportMaterialGoodsReceiptReportExcel, exportSupplierReportExcel, exportWarehouseReportExcel, exportWasteIssueReportExcel, exportWasteReportExcel } from '../../../controllers/api/warehouse/reportController.js';
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
    '/waste-issues/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportWasteIssueReportExcel
);

router.get(
    '/goods-receipts/materials/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportMaterialGoodsReceiptReportExcel
);

router.get(
    '/goods-receipts/consumables/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportConsumableGoodsReceiptReportExcel
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
