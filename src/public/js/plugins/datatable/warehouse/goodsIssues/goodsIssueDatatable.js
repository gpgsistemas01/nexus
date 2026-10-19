import { INVENTORY_RESOURCES } from '../../../../constants/inventory.js';
import { createIssueDatatable } from '../../shared/issues/issueDatatable.js';
import { hasPermission, UI_PERMISSIONS } from '../../../../constants/permissions.js';

export const createGoodsIssueDatatable = async ({ context, goodsIssues, onCreate, onEdit, onEditDetails, onReturnDetails }) => {

    const canManage = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);
    await createIssueDatatable({
        context,
        getIssues: goodsIssues.getAll,
        getIssue: goodsIssues.get,
        actionContext: 'goodsIssue',
        permissions: { canManage, canSupply },
        tableOptions: {
            searchPlaceholder: 'Buscar por Folio o Proyecto',
            order: [[0, 'desc']]
        },
        buttons: canManage ? [{ text: 'Nueva salida', action: onCreate }] : [],
        exportOptions: {
            report: goodsIssues.exportReport,
            filename: `reporte_salidas_${ goodsIssues.resource === INVENTORY_RESOURCES.CONSUMABLE ? 'consumibles' : 'materiales' }`
        },
        actions: { onEdit, onEditDetails, onReturnDetails }
    });
};
