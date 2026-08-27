import { getAllGoodsIssues } from "../../../../application/warehouse/goodsIssues/goodsIssues.js";
import { exportGoodsIssueReport } from "../../../../application/warehouse/report.js";
import { createIssueDatatable } from '../../shared/issues/issueDatatable.js';
import { hasPermission, UI_PERMISSIONS } from '../../../../constants/permissions.js';

export const createGoodsIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {

    const canManage = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);
    await createIssueDatatable({
        context,
        getIssues: getAllGoodsIssues,
        actionContext: 'goodsIssue',
        permissions: { canManage, canSupply },
        tableOptions: {
            searchPlaceholder: 'Buscar por Folio o Proyecto',
            order: [[0, 'desc']]
        },
        buttons: canManage ? [{ text: 'Nueva salida', action: onCreate }] : [],
        exportOptions: {
            report: exportGoodsIssueReport,
            filename: 'reporte_salidas'
        },
        actions: { onEdit, onEditDetails, onReturnDetails }
    });
};
