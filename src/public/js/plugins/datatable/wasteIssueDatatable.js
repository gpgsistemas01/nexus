import { getAllWasteIssues } from '../../application/warehouse/wasteIssues/wasteIssues.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import { createIssueDatatable } from './issueDatatable.js';
import { exportWasteIssueReport } from '../../application/warehouse/report.js';

export const createWasteIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {
    const canManage = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_SUPPLY);
    const issueDatatable = await createIssueDatatable({
        context,
        getIssues: getAllWasteIssues,
        actionContext: 'wasteIssue',
        permissions: { canManage, canSupply },
        tableOptions: {
            searchPlaceholder: 'Buscar por Folio o Proyecto',
            order: [[1, 'desc']]
        },
        buttons: canManage ? [{ text: 'Nueva salida', action: onCreate }] : [],
        exportOptions: {
            report: exportWasteIssueReport,
            filename: 'reporte_salidas_merma'
        },
        actions: { onEdit, onEditDetails, onReturnDetails }
    });
};
