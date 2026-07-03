import { AppError } from "../AppError.js";

export class ReferenceNumberUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de la base de datos al actualizar el folio', 'REFERENCE_NUMBER_UPDATE_DB_ERROR', 500);
    }
}