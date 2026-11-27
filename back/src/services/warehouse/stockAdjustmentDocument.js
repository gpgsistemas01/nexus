import { STOCK_ADJUSTMENT_STATUS_NAMES, STOCK_ADJUSTMENT_TYPES } from '../../constants/inventory.js';

export const buildAppliedAdjustmentHeader = ({ details, userId, appliedAt }) => {
    const [{ reasonId, observations }] = details;
    const hasDecrease = details.some(detail => detail.difference < 0);
    const hasIncrease = details.some(detail => detail.difference > 0);

    return {
        type: hasDecrease && hasIncrease ? STOCK_ADJUSTMENT_TYPES.MIXED
            : hasDecrease ? STOCK_ADJUSTMENT_TYPES.DECREASE : STOCK_ADJUSTMENT_TYPES.INCREASE,
        reasonId: details.every(detail => detail.reasonId === reasonId) ? reasonId : null,
        observations: details.every(detail => detail.observations === observations) ? observations : null,
        status: STOCK_ADJUSTMENT_STATUS_NAMES.APPLIED,
        appliedAt,
        createdById: userId,
        approvedById: userId
    };
};
