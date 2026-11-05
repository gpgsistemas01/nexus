import { AppError } from "../AppError.js";

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
