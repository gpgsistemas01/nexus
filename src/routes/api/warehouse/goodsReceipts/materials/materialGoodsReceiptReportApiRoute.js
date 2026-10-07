import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../../../constants/permissions.js';
import { exportMaterialGoodsReceiptReportExcel } from '../../../../../controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportController.js';

const router = express.Router();

router.get(
    '/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportMaterialGoodsReceiptReportExcel
);

export default router;
