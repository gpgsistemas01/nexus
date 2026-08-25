import { AppError } from "../AppError.js";

export class WasteNotFound extends AppError {

    constructor () {
        super('La merma no existe.', 'WASTE_NOT_FOUND', 404);
    }
}

export class WasteAlreadyExists extends AppError {

    constructor () {
        super(
            'Ya existe una merma para el material, proveedor y dimensiones indicados.',
            'WASTE_ALREADY_EXISTS',
            409
        );
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

export class WasteDeleteDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al eliminar la merma.', 'WASTE_DELETE_DB_ERROR', 500);
    }
}

export class WasteInitialStockReasonNotFound extends AppError {

    constructor () {
        super('Razón de stock inicial no encontrada para registrar la merma.', 'WASTE_INITIAL_STOCK_REASON_NOT_FOUND', 404);
    }
}

export class WasteMaxUnitCostRequired extends AppError {

    constructor () {
        super(
            'Capture el costo máximo de la merma porque el material seleccionado no tiene un costo disponible.',
            'WASTE_MAX_UNIT_COST_REQUIRED',
            400
        );
    }
}
