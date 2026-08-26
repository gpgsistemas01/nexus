import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';
import { createIssueDetailDatatable } from './issueDetailDatatable.js';
import { buildDetailsColumns } from './detailBuilder/detailColumns.js';
import { buildDetailsHeader } from './detailBuilder/detailHeader.js';
import { hasPermission, UI_PERMISSIONS } from '../../../../constants/permissions.js';

export const buildWarehouseIssueDetailsConfig = ({
    mode,
    context = {},
    itemLabel = 'Material',
    projectQuantityPermission = UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE
}) => {
    const tableContext = {
        type: 'issue',
        mode,
        canManageProjectQuantity: hasPermission(context, projectQuantityPermission)
    };

    return {
        header: buildDetailsHeader({ ...tableContext, itemLabel }),
        columns: buildDetailsColumns(tableContext)
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
    itemLabel = 'Material',
    projectQuantityPermission = UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE,
    selector = DATATABLE_SELECTORS.MATERIAL
}) => {
    const { header, columns } = buildWarehouseIssueDetailsConfig({
        mode,
        context,
        itemLabel,
        projectQuantityPermission
    });

    return createIssueDetailDatatable({ selector, data, header, columns });
};
