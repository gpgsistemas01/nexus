import { AppError } from '../AppError.js';
import { errorMap } from '../../messages/codeMessages.js';
import { errorMessages } from '../../shared/messages/apiMessages.js';

const statuses = { VALIDATION: 400, CONFLICT: 409, BUSY: 409, PHYSICAL_RETURN_REQUIRED: 400 };

export class HistoricalDeliveryError extends AppError {
    constructor(kind = 'VALIDATION', message) {
        const code = errorMap.historicalDelivery[kind];
        super(message ?? errorMessages[code], code, statuses[kind]);
    }
}
