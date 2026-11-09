import { FULFILLMENT_STATUS_NAMES } from '../../../shared/constants/fulfillmentStatuses.js';

const FLOAT_EPSILON = 0.000001;

export const resolveGoodsIssueDetailFulfillmentStatusName = (detail = {}) => {
    const suppliedQuantity = Number(detail.suppliedQuantity ?? 0);
    const returnedQuantity = Number(detail.returnedQuantity ?? 0);

    if (
        detail.isSupplied
        && suppliedQuantity > FLOAT_EPSILON
        && returnedQuantity >= suppliedQuantity - FLOAT_EPSILON
    ) {
        return FULFILLMENT_STATUS_NAMES.CANCELED;
    }

    if (detail.isSupplied) return FULFILLMENT_STATUS_NAMES.COMPLETE;

    return suppliedQuantity > FLOAT_EPSILON
        ? FULFILLMENT_STATUS_NAMES.PARTIAL
        : FULFILLMENT_STATUS_NAMES.PENDING;
};
