import materialGoodsIssueReportApiRoute from './warehouse/goodsIssues/materials/materialGoodsIssueReportApiRoute.js';
import consumableGoodsIssueReportApiRoute from './warehouse/goodsIssues/consumables/consumableGoodsIssueReportApiRoute.js';
import materialGoodsReceiptReportApiRoute from './warehouse/goodsReceipts/materials/materialGoodsReceiptReportApiRoute.js';
import consumableGoodsReceiptReportApiRoute from './warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportApiRoute.js';
import authApiRoutes from './authApiRoute.js';
import clientApiRoutes from './sales/clientApiRoute.js';
import salesReportApiRoutes from './sales/reportApiRoute.js';
import materialApiRoutes from './warehouse/materialApiRoute.js';
import consumableApiRoutes from './warehouse/consumableApiRoute.js';
import wasteApiRoutes from './warehouse/wasteApiRoute.js';
import wasteIssueApiRoutes from './warehouse/wasteIssueApiRoute.js';
import supplierApiRoutes from './warehouse/supplierApiRoute.js';
import materialGoodsReceiptApiRoutes from './warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js';
import consumableGoodsReceiptApiRoutes from './warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js';
import materialGoodsIssueApiRoutes from './warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js';
import consumableGoodsIssueApiRoutes from './warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js';
import warehouseReportApiRoutes from './warehouse/reportApiRoute.js';
import unitMeasuresApiRoutes from './warehouse/unitMeasureApiRoute.js';
import presentationApiRoutes from './warehouse/presentationApiRoute.js';
import reasonApiRoutes from './warehouse/reasonApiRoute.js';
import fulfillmentStatusApiRoutes from './warehouse/fulfillmentStatusApiRoute.js';
import userApiRoutes from './admin/userApiRoute.js';
import roleApiRoutes from './admin/roleApiRoute.js';
import departmentApiRoutes from './admin/departmentApiRoute.js';
import personApiRoutes from './admin/personApiRoute.js';
import movementApiRoutes from './admin/movementApiRoute.js';
import adminReportApiRoutes from './admin/reportApiRoute.js';
import catalogApiRoutes from './admin/catalogApiRoute.js';

const API_ROUTES = [
    ['/auth', authApiRoutes],
    ['/sales/clients', clientApiRoutes],
    ['/sales/reports', salesReportApiRoutes],
    ['/warehouse/materials', materialApiRoutes],
    ['/warehouse/consumables', consumableApiRoutes],
    ['/warehouse/wastes', wasteApiRoutes],
    ['/warehouse/waste-issues', wasteIssueApiRoutes],
    ['/warehouse/suppliers', supplierApiRoutes],
    ['/warehouse/goods-receipts/materials', materialGoodsReceiptApiRoutes],
    ['/warehouse/goods-receipts/consumables', consumableGoodsReceiptApiRoutes],
    ['/warehouse/goods-issues/materials', materialGoodsIssueApiRoutes],
    ['/warehouse/goods-issues/consumables', consumableGoodsIssueApiRoutes],
    ['/warehouse/reports/goods-issues/materials', materialGoodsIssueReportApiRoute],
    ['/warehouse/reports/goods-issues/consumables', consumableGoodsIssueReportApiRoute],
    ['/warehouse/reports/goods-receipts/materials', materialGoodsReceiptReportApiRoute],
    ['/warehouse/reports/goods-receipts/consumables', consumableGoodsReceiptReportApiRoute],
    ['/warehouse/reports', warehouseReportApiRoutes],
    ['/warehouse/unit-measures', unitMeasuresApiRoutes],
    ['/warehouse/presentations', presentationApiRoutes],
    ['/warehouse/reasons', reasonApiRoutes],
    ['/warehouse/fulfillment-statuses', fulfillmentStatusApiRoutes],
    ['/admin/users', userApiRoutes],
    ['/admin/roles', roleApiRoutes],
    ['/admin/departments', departmentApiRoutes],
    ['/admin/persons', personApiRoutes],
    ['/admin/movements', movementApiRoutes],
    ['/admin/reports', adminReportApiRoutes],
    ['/admin/catalogs', catalogApiRoutes]
];

export const registerApiRoutes = (app, { apiPrefix = '/api' } = {}) => {
    API_ROUTES.forEach(([path, router]) => app.use(`${apiPrefix}${path}`, router));
};
