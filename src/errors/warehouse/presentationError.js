import { AppError } from "../AppError.js";

export class PresentationNotFound extends AppError {

    constructor() {
        super('Presentación no encontrada', 'PRESENTATION_NOT_FOUND', 404);
    }
}

export class PresentationFindDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al buscar la presentación', 'PRESENTATION_FIND_DB_ERROR', 500);
    }
}