import { getAllWasteIssues } from '../../application/warehouse/wasteIssues/wasteIssues.js';
import { createDataTable, renderActionButtons } from './baseDatatable.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import {
    bindIssueTableActions,
    buildIssueHeaderColumns,
    buildIssueTrackingColumns
} from './issueDatatable.js';
import { setupTableFilters } from './utils/filters/tableFilter.js';

const TABLE_SELECTOR = '#table';

export const createWasteIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {
    const canManage = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_SUPPLY);
    const columns = buildIssueHeaderColumns({ context });

    columns.push(
        ...buildIssueTrackingColumns(),
        {
            title: 'Acciones',
            data: null,
            orderable: false,
            render: (_, __, issue) => {
                return renderActionButtons({
                    context: 'wasteIssue',
                    fulfillmentStatus: issue.fulfillmentStatus?.name,
                    canManage,
                    canSupply
                });
            }
        }
    );

    const filters = await setupTableFilters({
        fields: ['date', 'client', 'department', 'independentPerson', 'fulfillmentStatus', 'observations']
    });

    const table = createDataTable({ options: {
        ajax: {
            get: params => getAllWasteIssues({
                ...params,
                ...filters.getValues()
            })
        },
        searchPlaceholder: 'Buscar por Folio, Observaciones o Material',
        order: [[1, 'desc']],
        buttons: canManage ? [{ text: 'Nueva salida', action: onCreate }] : [],
        columns
    } });

    bindIssueTableActions({
        table,
        tableSelector: TABLE_SELECTOR,
        onEdit,
        onEditDetails,
        onReturnDetails
    });

    return table;
};
