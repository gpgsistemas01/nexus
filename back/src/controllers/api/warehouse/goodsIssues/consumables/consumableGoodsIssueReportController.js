import { findConsumableGoodsIssueReportRows } from '../../../../../services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js';
import { buildGoodsIssueReportHandler } from '../../reportController.js';

export const exportConsumableGoodsIssueReportExcel = buildGoodsIssueReportHandler({
    findGoodsIssueReportRows: findConsumableGoodsIssueReportRows,
    filename: 'reporte_salidas_consumibles'
});
