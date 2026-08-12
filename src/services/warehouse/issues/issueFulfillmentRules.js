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
    if (details.every(isDetailComplete)) return FULFILLMENT_STATUS_NAMES.COMPLETE;
    if (details.some(isDetailPartiallySupplied)) return FULFILLMENT_STATUS_NAMES.PARTIAL;

    return FULFILLMENT_STATUS_NAMES.PENDING;
};
