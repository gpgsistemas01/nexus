import { formatDateTimeDisplay } from '../../utils/formatters.js';
import { getResponsiveRowData } from './utils/responsive.js';

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

export const bindIssueTableAction = ({ table, tableSelector, buttonSelector, callback }) => {
    $(`${ tableSelector } tbody`).on('click', buttonSelector, function () {
        callback(getResponsiveRowData(table, this));
    });
};
