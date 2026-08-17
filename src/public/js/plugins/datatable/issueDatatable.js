import { formatDateTimeDisplay, formatFileName } from '../../utils/formatters.js';
import { getResponsiveRowData } from './utils/responsive.js';
import { setupTableFilters } from './utils/filters/tableFilter.js';
import { createDataTable, renderActionButtons } from './baseDatatable.js';
import { buildExcelButton, buildTableExportParams } from '../../ui/tableUI.js';
import { DATATABLE_SELECTORS } from '../../constants/selectors.js';

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
    permissions: { canManage, canSupply },
    tableOptions: { searchPlaceholder, order },
    buttons = [],
    exportOptions = null,
    actions = {}
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
    let table;
    const exportButton = exportOptions?.report && exportOptions?.filename
        ? buildExcelButton({
            filename: formatFileName(exportOptions.filename),
            request: ({ monthlyReport = false } = {}) => exportOptions.report(buildTableExportParams(table, {
                ...filters.getValues(),
                monthlyReport
            }))
        })
        : null;
    const configuredButtons = exportButton ? [...buttons, exportButton] : buttons;

    table = createDataTable({ options: {
        ajax: {
            get: params => getIssues({ ...params, ...filters.getValues() })
        },
        searchPlaceholder,
        order,
        buttons: configuredButtons,
        columns
    } });

    bindIssueTableActions({
        table,
        tableSelector: DATATABLE_SELECTORS.MAIN,
        ...actions
    });

    return { table, filters };
};
