import { AppError } from '../AppError.js';

export class IssueCanceledConflict extends AppError {
    constructor() {
        super('La salida está cancelada y sólo puede consultarse.', 'ISSUE_CANCELED_CONFLICT', 409);
    }
}
