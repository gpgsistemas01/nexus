import { formatDateTimeDisplay } from '../../utils/formatters.js';
import { getResponsiveRowData } from './utils/responsive.js';
import { setupTableFilters } from './utils/filters/tableFilter.js';
import { createDataTable, renderActionButtons } from './baseDatatable.js';

const ISSUE_FILTER_FIELDS = [
    'date',
    'client',
    'department',
    'independentPerson',
    'fulfillmentStatus',
    'observations'
];

export const setupIssueTableFilters = () => setupTableFilters({
    fields: ISSUE_FILTER_FIELDS
});

export const buildIssueHeaderColumns = ({ context }) => {
    const { isWarehouse = false, isSystem = false } = context.organization || {};
    const columns = [
        { title: 'Folio', data: 'referenceNumber' },
        {
            title: 'Solicitud',
            data: null,
            render: (_, __, issue) => (
                `<div>${ issue.requesterName }<br><small>${ formatDateTimeDisplay(issue.requestDate) }</small></div>`
            )
        }
    ];

    if (isWarehouse || isSystem) {
        columns.push({ title: 'Área', data: 'departmentName' });
    }

    return columns;
};

export const buildIssueTrackingColumns = () => [
    { title: 'Proyecto', data: 'projectNumber' },
    { title: 'Cliente', data: 'clientName' },
    { title: 'Estado', data: 'status.name' },
    { title: 'Estado surtido', data: 'fulfillmentStatus.name' }
];

export const bindIssueTableAction = ({ table, tableSelector, buttonSelector, callback }) => {
    $(`${ tableSelector } tbody`).on('click', buttonSelector, function () {
        callback(getResponsiveRowData(table, this));
    });
};

export const bindIssueTableActions = ({ table, tableSelector, onEdit, onEditDetails, onReturnDetails }) => {
    [
        ['.btn-edit-detail', onEditDetails],
        ['.btn-edit', onEdit],
        ['.btn-return-detail', onReturnDetails]
    ].forEach(([buttonSelector, callback]) => bindIssueTableAction({
        table,
        tableSelector,
        buttonSelector,
        callback
    }));
};

export const createIssueDatatable = async ({
    context,
    getIssues,
    actionContext,
    canManage,
    canSupply,
    searchPlaceholder,
    order,
    buttons = [],
    tableSelector,
    onEdit,
    onEditDetails,
    onReturnDetails
}) => {
    const columns = buildIssueHeaderColumns({ context });

    columns.push(
        ...buildIssueTrackingColumns(),
        {
            title: 'Acciones',
            data: null,
            orderable: false,
            render: (_, __, issue) => renderActionButtons({
                context: actionContext,
                status: issue.status?.name,
                fulfillmentStatus: issue.fulfillmentStatus?.name,
                canManage,
                canSupply
            })
        }
    );

    const filters = await setupIssueTableFilters();
    const table = createDataTable({ options: {
        ajax: {
            get: params => getIssues({ ...params, ...filters.getValues() })
        },
        searchPlaceholder,
        order,
        buttons,
        columns
    } });

    bindIssueTableActions({
        table,
        tableSelector,
        onEdit,
        onEditDetails,
        onReturnDetails
    });

    return { table, filters };
};
