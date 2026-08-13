import { getAllWasteIssues } from '../../application/warehouse/wasteIssues/wasteIssues.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import { createIssueDatatable } from './issueDatatable.js';

const TABLE_SELECTOR = '#table';

export const createWasteIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {
    const canManage = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_SUPPLY);
    const { table } = await createIssueDatatable({
        context,
        getIssues: getAllWasteIssues,
        actionContext: 'wasteIssue',
        canManage,
        canSupply,
        searchPlaceholder: 'Buscar por Folio, Observaciones o Material',
        order: [[1, 'desc']],
        buttons: canManage ? [{ text: 'Nueva salida', action: onCreate }] : [],
        tableSelector: TABLE_SELECTOR,
        onEdit,
        onEditDetails,
        onReturnDetails
    });

    return table;
};
