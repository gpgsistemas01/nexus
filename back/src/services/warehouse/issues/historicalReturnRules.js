import { AppError } from '../../../errors/AppError.js';

export const assertHistoricalPhysicalReturn = ({ issue, returnDto }) => {
    if (issue.historicalDeliveryBatchId && returnDto.physicalReturnConfirmed !== true) {
        throw new AppError('Confirma la entrada física actual de esta devolución histórica.', 'HISTORICAL_PHYSICAL_RETURN_REQUIRED', 400);
    }
};
