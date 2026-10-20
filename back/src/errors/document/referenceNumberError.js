import { AppError } from "../AppError.js";

export class ReferenceNumberUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de la base de datos al actualizar el folio', 'REFERENCE_NUMBER_UPDATE_DB_ERROR', 500);
    }
}

export class ReferenceNumberAlreadyExists extends AppError {

    constructor ({ referenceNumber = null } = {}) {
        super(
            'El folio generado ya existe. Intenta realizar la operación nuevamente.',
            'REFERENCE_NUMBER_ALREADY_EXISTS',
            409
        );
        this.meta = referenceNumber ? { referenceNumber } : undefined;
    }
}
