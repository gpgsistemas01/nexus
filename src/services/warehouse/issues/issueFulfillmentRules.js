import { FULFILLMENT_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';

const FLOAT_EPSILON = 0.000001;

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
