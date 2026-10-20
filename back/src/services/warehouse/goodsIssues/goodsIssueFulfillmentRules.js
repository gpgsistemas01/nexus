import { FULFILLMENT_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';

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

    return detail.isSupplied
        ? FULFILLMENT_STATUS_NAMES.COMPLETE
        : FULFILLMENT_STATUS_NAMES.PENDING;
};
