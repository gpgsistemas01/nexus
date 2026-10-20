import { FULFILLMENT_STATUS_NAMES } from '../../../../../constants/fulfillmentStatuses.js';
import { FORM_MODES } from '../../../../../constants/formModes.js';
import { GOODS_RECEIPT_STATUS_LABELS } from '../../../../../constants/goodsReceiptStatuses.js';

const RECEIPT_DETAIL_ACTION_MODES = [FORM_MODES.EDIT];

export const shouldShowReceiptPurchaseColumns = ({ type }) => type === 'receipt';
export const shouldShowIssueSuppliedQuantity = ({ type, mode }) => (
    type === 'issue' && [FORM_MODES.EDIT_DETAIL, FORM_MODES.RETURN].includes(mode)
);
export const shouldShowIssueReturnedQuantity = ({ type, mode }) => type === 'issue' && mode === FORM_MODES.RETURN;
export const shouldShowIssueProjectColumns = ({ type, mode, canManageProjectQuantity }) => (
    type === 'issue' && canManageProjectQuantity && mode === FORM_MODES.EDIT_DETAIL
);
export const shouldShowActionsColumn = ({ type, mode }) => {
    if (type === 'receipt') return mode === FORM_MODES.CREATE;

    return ![FORM_MODES.EDIT_DETAIL, FORM_MODES.EDIT_HEADER, FORM_MODES.RETURN, FORM_MODES.VIEW].includes(mode);
};
export const shouldShowIssueReturnActions = ({ type, mode }) => type === 'issue' && mode === FORM_MODES.RETURN;
export const shouldShowReceiptDetailActions = ({ type, mode }) => (
    type === 'receipt' && RECEIPT_DETAIL_ACTION_MODES.includes(mode)
);
export const shouldShowDetailActionsHeader = context => (
    shouldShowIssueReturnActions(context)
    || shouldShowReceiptDetailActions(context)
    || shouldShowActionsColumn(context)
);

export const isCanceledDetail = (row = {}) => {
    const statusName = row.fulfillmentStatus?.name || row.status?.name || row.status;

    return Boolean(
        row.isCanceled
        || row.isCancelled
        || row.canceledAt
        || row.cancelledAt
        || statusName === FULFILLMENT_STATUS_NAMES.CANCELED
        || statusName === GOODS_RECEIPT_STATUS_LABELS.CANCELED
    );
};

export const resolveDetailActionIdentifier = (row = {}) => (
    row.id ?? row.clientId ?? row.wasteId ?? row.materialId
);

export const shouldShowDetailActionButtons = ({ row, mode }) => (
    !isCanceledDetail(row) && (
        mode === FORM_MODES.CREATE
        || Boolean(resolveDetailActionIdentifier(row))
    )
);

export const resolveIssueSuppliedQuantityForDisplay = (row = {}) => (
    isCanceledDetail(row) ? row.returnedQuantity : row.suppliedQuantity
);
