import { findMaterialGoodsIssueReportRows } from '../../../../../services/warehouse/goodsIssues/materials/materialGoodsIssueService.js';
import { buildGoodsIssueReportHandler } from '../../reportController.js';

export const exportMaterialGoodsIssueReportExcel = buildGoodsIssueReportHandler({
    findGoodsIssueReportRows: findMaterialGoodsIssueReportRows,
    filename: 'reporte_salidas_materiales'
});
