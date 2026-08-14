import authApiRoutes from './authApiRoute.js';
import clientApiRoutes from './sales/clientApiRoute.js';
import salesReportApiRoutes from './sales/reportApiRoute.js';
import materialApiRoutes from './warehouse/materialApiRoute.js';
import wasteApiRoutes from './warehouse/wasteApiRoute.js';
import wasteIssueApiRoutes from './warehouse/wasteIssueApiRoute.js';
import supplierApiRoutes from './warehouse/supplierApiRoute.js';
import goodsReceiptApiRoutes from './warehouse/goodsReceiptApiRoute.js';
import goodsIssueApiRoutes from './warehouse/goodsIssueApiRoute.js';
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

const API_ROUTES = [
    ['/auth', authApiRoutes],
    ['/sales/clients', clientApiRoutes],
    ['/sales/reports', salesReportApiRoutes],
    ['/warehouse/materials', materialApiRoutes],
    ['/warehouse/wastes', wasteApiRoutes],
    ['/warehouse/waste-issues', wasteIssueApiRoutes],
    ['/warehouse/suppliers', supplierApiRoutes],
    ['/warehouse/goods-receipts', goodsReceiptApiRoutes],
    ['/warehouse/goods-issues', goodsIssueApiRoutes],
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
    ['/admin/reports', adminReportApiRoutes]
];

export const registerApiRoutes = (app, { apiPrefix = '/api' } = {}) => {
    API_ROUTES.forEach(([path, router]) => app.use(`${apiPrefix}${path}`, router));
};
