import { getAllWasteIssues } from '../../application/warehouse/wasteIssues/wasteIssues.js';
import { createDataTable } from './baseDatatable.js';
import {
    buildMdbEditActionButton,
    buildMdbReturnActionButton,
    buildMdbSupplyActionButton
} from '../mdb/actionButton.js';
import { FULFILLMENT_STATUS_NAMES } from '../../constants/fulfillmentStatuses.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import {
    bindIssueTableAction,
    buildIssueHeaderColumns,
    buildIssueTrackingColumns
} from './issueDatatable.js';
import { setupTableFilters } from './utils/filters/tableFilter.js';

const TABLE_SELECTOR = '#table';

const editButton = buildMdbEditActionButton({
    className: 'js-edit',
    label: 'Editar salida'
});
const supplyButton = buildMdbSupplyActionButton({
    className: 'js-edit-details',
    label: 'Surtir salida'
});
const returnButton = buildMdbReturnActionButton({
    className: 'js-return-details',
    label: 'Devolver merma surtida'
});

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
                const isComplete = issue.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.COMPLETE;
                return `${ canManage ? editButton : '' }${ !canSupply ? '' : isComplete ? returnButton : supplyButton }`;
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

    [
        ['.js-edit-details', onEditDetails],
        ['.js-edit', onEdit],
        ['.js-return-details', onReturnDetails]
    ].forEach(([buttonSelector, callback]) => bindIssueTableAction({
        table,
        tableSelector: TABLE_SELECTOR,
        buttonSelector,
        callback
    }));

    return table;
};
