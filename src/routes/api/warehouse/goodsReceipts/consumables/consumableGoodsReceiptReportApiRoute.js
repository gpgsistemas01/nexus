import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../../../constants/permissions.js';
import { exportConsumableGoodsReceiptReportExcel } from '../../../../../controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportController.js';

const router = express.Router();

router.get(
    '/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportConsumableGoodsReceiptReportExcel
);

export default router;
