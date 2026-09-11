import { AppError } from './AppError.js';

export class CatalogEntryNotFound extends AppError {
    constructor() {
        super('Registro de catálogo no encontrado.', 'CATALOG_ENTRY_NOT_FOUND', 404);
    }
}

export class CatalogEntryConflict extends AppError {
    constructor(code = 'CATALOG_ENTRY_ALREADY_EXISTS') {
        const messages = {
            CATALOG_ENTRY_ALREADY_EXISTS: 'Ya existe un registro con esos datos.',
            CATALOG_ENTRY_IN_USE: 'El registro no puede eliminarse porque está en uso.'
        };

        super(messages[code], code, 409);
    }
}
