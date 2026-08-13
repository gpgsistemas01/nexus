import { DATATABLE_SELECTORS } from '../../constants/selectors.js';
import { createIssueDetailDatatable } from './issueDetailDatatable.js';
import { buildDetailsColumns, buildDetailsHeader } from './utils/builderDetailDatatable.js';
import { renderWarehouseItemName } from './utils/detailDatatableUtils.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';

export const buildWarehouseIssueDetailsConfig = ({ mode, context = {} }) => {
    const tableContext = {
        type: 'issue',
        mode,
        canManageProjectQuantity: hasPermission(context, UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE)
    };

    return {
        header: buildDetailsHeader(tableContext),
        columns: buildDetailsColumns({
            ...tableContext,
            render: (_, __, detail) => renderWarehouseItemName(detail)
        })
    };
};

/**
 * Canonical detail table for goods and waste issues.
 * The form mode always produces the same headers and columns in both flows.
 */
export const createWarehouseIssueDetailsTable = ({
    data,
    mode,
    context = {},
    selector = DATATABLE_SELECTORS.MATERIAL
}) => {
    const { header, columns } = buildWarehouseIssueDetailsConfig({ mode, context });

    return createIssueDetailDatatable({ selector, data, header, columns });
};
