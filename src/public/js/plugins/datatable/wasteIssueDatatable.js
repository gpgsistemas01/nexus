import { getAllWasteIssues } from '../../application/warehouse/wasteIssues/wasteIssues.js';
import { createDataTable } from './baseDatatable.js';
import { buildMdbActionButton } from '../mdb/actionButton.js';
import { FULFILLMENT_STATUS_NAMES } from '../../constants/fulfillmentStatuses.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import { bindIssueTableAction, buildIssueHeaderColumns } from './issueDatatable.js';

const TABLE_SELECTOR = '#table';

const editButton = buildMdbActionButton({
    className: 'js-edit',
    colorClass: 'btn-primary',
    iconClass: 'fa-solid fa-pencil',
    label: 'Editar salida'
});
const supplyButton = buildMdbActionButton({
    className: 'js-edit-details',
    colorClass: 'btn-secondary',
    iconClass: 'fa-solid fa-dolly',
    label: 'Surtir salida'
});
const returnButton = buildMdbActionButton({
    className: 'js-return-details',
    colorClass: 'btn-warning',
    iconClass: 'fa-solid fa-rotate-left',
    label: 'Devolver merma surtida'
});

export const createWasteIssueDatatable = ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {
    const canManage = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.WASTE_ISSUES_SUPPLY);
    const columns = buildIssueHeaderColumns({ context });

    columns.push(
        { title: 'Proyecto', data: 'projectNumber' },
        { title: 'Cliente', data: 'clientName' },
        { title: 'Estado surtido', data: 'fulfillmentStatus.name' },
        { title: 'Observaciones', data: 'observations', defaultContent: '' },
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

    const table = createDataTable({ options: {
        ajax: { get: params => getAllWasteIssues(params) },
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
