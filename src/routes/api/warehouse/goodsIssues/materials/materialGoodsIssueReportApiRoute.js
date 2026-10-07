import express from 'express';
import { authorizeUserApi, verifyApiTokenRequired } from '../../../../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../../../../constants/permissions.js';
import { exportMaterialGoodsIssueReportExcel } from '../../../../../controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueReportController.js';

const router = express.Router();

router.get(
    '/excel',
    verifyApiTokenRequired,
    authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    exportMaterialGoodsIssueReportExcel
);

export default router;
