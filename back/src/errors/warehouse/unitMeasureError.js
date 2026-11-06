import { AppError } from "../AppError.js";

export class UnitMeasureNotFound extends AppError {

    constructor () {
        super('Unidad no encontrado', 'UNIT_MEASURE_NOT_FOUND', 404);
    }
}