import { AppError } from "../AppError.js";

export class UnitMeasureNotFound extends AppError {

    constructor () {
        super('Unidad no encontrado', 'UNIT_MEASURE_NOT_FOUND', 404);
    }
}

export class UnitMeasureFindDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al buscar la unidad', 'UNIT_MEASURE_FIND_DB_ERROR', 500);
    }
}