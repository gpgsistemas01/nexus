import { getAllWasteIssues } from '../../application/warehouse/wasteIssues/wasteIssues.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import { createIssueDatatable } from './issueDatatable.js';
import { exportWasteIssueReport } from '../../application/warehouse/report.js';
import { buildExcelButton, buildTableExportParams } from '../../ui/tableUI.js';
import { formatFileName } from '../../utils/formatters.js';

const TABLE_SELECTOR = '#table';

export const createWasteIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {
    const canManage = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_SUPPLY);
    let table;
    let filters = { getValues: () => ({}) };
    const buttons = [
        ...(canManage ? [{ text: 'Nueva salida', action: onCreate }] : []),
        buildExcelButton({
            filename: formatFileName('reporte_salidas_merma'),
            request: ({ monthlyReport = false } = {}) => exportWasteIssueReport(buildTableExportParams(table, {
                ...filters.getValues(),
                monthlyReport
            }))
        })
    ];
    const issueDatatable = await createIssueDatatable({
        context,
        getIssues: getAllWasteIssues,
        actionContext: 'wasteIssue',
        canManage,
        canSupply,
        searchPlaceholder: 'Buscar por Folio, Observaciones o Material',
        order: [[1, 'desc']],
        buttons,
        tableSelector: TABLE_SELECTOR,
        onEdit,
        onEditDetails,
        onReturnDetails
    });

    table = issueDatatable.table;
    filters = issueDatatable.filters;

    return table;
};
