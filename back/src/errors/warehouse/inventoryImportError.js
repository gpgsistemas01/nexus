import { AppError } from '../AppError.js';
import { errorMap } from '../../messages/codeMessages.js';
import { errorMessages } from '../../shared/messages/apiMessages.js';

const statuses = { LIMIT: 413, BUSY: 429, EXPIRED: 410, NOT_FOUND: 404, STATE: 409, CONFLICT: 409 };

export class InventoryImportError extends AppError {
    constructor(kind = 'FILE', meta) {
        const code = errorMap.inventoryImport[kind];
        super(errorMessages[code], code, statuses[kind] ?? 400);
        if (meta) this.meta = meta;
    }
}
