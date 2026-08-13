import { formatDateTimeDisplay } from '../../utils/formatters.js';
import { getResponsiveRowData } from './utils/responsive.js';
import { setupTableFilters } from './utils/filters/tableFilter.js';

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

export const buildIssueTrackingColumns = ({ includeStatus = false } = {}) => [
    { title: 'Proyecto', data: 'projectNumber' },
    { title: 'Cliente', data: 'clientName' },
    ...(includeStatus ? [{ title: 'Estado', data: 'status.name' }] : []),
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
