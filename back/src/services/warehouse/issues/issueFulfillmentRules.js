import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../shared/constants/fulfillmentStatuses.js';
import { IssueCanceledConflict } from '../../../errors/inventory/issueError.js';

const FLOAT_EPSILON = 0.000001;

export const assertIssueNotCanceled = issue => {
    if (issue.status?.name === GOODS_ISSUE_STATUS_NAMES.CANCELED
        || issue.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED) {
        throw new IssueCanceledConflict();
    }
};

const isDetailComplete = detail => (
    detail.isSupplied === true
    || Number(detail.suppliedQuantity ?? 0) >= Number(detail.quantity ?? 0) - FLOAT_EPSILON
);

const isDetailPartiallySupplied = detail => (
    Number(detail.suppliedQuantity ?? 0) > FLOAT_EPSILON
);

export const resolveIssueDetailFulfillmentStatus = detail => {
    if (isDetailComplete(detail)) return FULFILLMENT_STATUS_NAMES.COMPLETE;
    if (isDetailPartiallySupplied(detail)) return FULFILLMENT_STATUS_NAMES.PARTIAL;

    return FULFILLMENT_STATUS_NAMES.PENDING;
};

export const resolveIssueFulfillmentStatus = details => {
    let allComplete = true;
    let hasSuppliedQuantity = false;
    for (const detail of details) {
        allComplete &&= isDetailComplete(detail);
        hasSuppliedQuantity ||= isDetailPartiallySupplied(detail);
        if (!allComplete && hasSuppliedQuantity) return FULFILLMENT_STATUS_NAMES.PARTIAL;
    }

    return allComplete ? FULFILLMENT_STATUS_NAMES.COMPLETE : FULFILLMENT_STATUS_NAMES.PENDING;
};
