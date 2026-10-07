import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../../../constants/permissions.js';
import { exportConsumableGoodsIssueReportExcel } from '../../../../../controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportController.js';

const router = express.Router();

router.get(
    '/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportConsumableGoodsIssueReportExcel
);

export default router;
