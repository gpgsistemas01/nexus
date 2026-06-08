import { AppError } from "../AppError.js";

export class WasteNotFound extends AppError {

    constructor () {
        super('La merma no existe.', 'WASTE_NOT_FOUND', 404);
    }
}

export class WasteUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar la merma.', 'WASTE_UPDATE_DB_ERROR', 500);
    }
}

export class WasteStockAdjustmentDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el stock de la merma.', 'WASTE_STOCK_ADJUSTMENT_DB_ERROR', 500);
    }
}
