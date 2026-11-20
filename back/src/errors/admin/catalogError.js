import { errorMessages } from '../../shared/messages/apiMessages.js';
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

export class CatalogMeasurementInUse extends AppError {
    constructor() {
        super('La presentación o unidad está vinculada a artículos o mermas. Sólo puede cambiar su estado.', errorMap.catalog.MEASUREMENT_IN_USE, 409);
    }
}

export class CatalogFilterInvalid extends AppError {
    constructor() {
        const code = errorMap.catalog.FILTER_INVALID;
        super(errorMessages[code], code, 400);
    }
}
