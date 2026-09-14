import { errorMap } from '../../messages/codeMessages.js';
import { AppError } from '../AppError.js';

export class CatalogNotFound extends AppError {

    constructor(catalogName) {
        super(`El catálogo ${ catalogName } no está disponible`, errorMap.catalog.NOT_FOUND, 404);
        this.meta = { catalogName };
    }
}

export class CatalogValidationError extends AppError {

    constructor(catalogLabel) {
        super(
            `Complete correctamente los campos del catálogo ${ catalogLabel }`,
            errorMap.catalog.VALIDATION_ERROR,
            400
        );
        this.meta = { catalogLabel };
    }
}

export class CatalogEntryNotFound extends AppError {

    constructor(catalogLabel) {
        super(
            `El registro de ${ catalogLabel } no está disponible`,
            errorMap.catalog.ENTRY_NOT_FOUND,
            404
        );
        this.meta = { catalogLabel };
    }
}
