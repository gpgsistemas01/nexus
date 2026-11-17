import { AppError } from './AppError.js';
import { errorMap } from '../messages/codeMessages.js';
import { errorMessages } from '../shared/messages/apiMessages.js';

export class ReportMonthInvalid extends AppError {
    constructor() {
        const code = errorMap.report.INVALID_MONTH;
        super(errorMessages[code], code, 500);
    }
}
