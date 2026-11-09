import { HistoricalDeliveryError } from '../../../errors/warehouse/historicalDeliveryError.js';

export const assertHistoricalPhysicalReturn = ({ issue, returnDto }) => {
    if (issue.historicalDeliveryBatchId && returnDto.physicalReturnConfirmed !== true) {
        throw new HistoricalDeliveryError('PHYSICAL_RETURN_REQUIRED');
    }
};
