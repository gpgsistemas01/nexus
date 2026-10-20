import { AppError } from "../AppError.js";

export class WasteMaterialInvalid extends AppError {
    constructor() {
        super('Seleccione un material con unidad de metro cuadrado (m²) para registrar merma.', 'WASTE_MATERIAL_INVALID', 400);
    }
}

export class WasteDimensionsInvalid extends AppError {
    constructor() {
        super('Complete las dimensiones de la merma o los pesos necesarios para calcularlas.', 'WASTE_DIMENSIONS_INVALID', 400);
    }
}

export class WasteWeightReadOnly extends AppError {
    constructor() {
        super('No se pueden modificar los pesos de una merma ya registrada. Estos datos sólo están disponibles para consulta.', 'WASTE_WEIGHT_READ_ONLY', 400);
    }
}

export class WasteWeightInvalid extends AppError {
    constructor() {
        super('Capture pesos válidos de cono, merma y rollo completo; sólo aplican a Rollo.', 'WASTE_WEIGHT_INVALID', 400);
    }
}

export class WasteNotFound extends AppError {

    constructor () {
        super('La merma no existe.', 'WASTE_NOT_FOUND', 404);
    }
}

export class WasteAlreadyExists extends AppError {

    constructor ({ waste = null } = {}) {
        super(
            'Ya existe una merma con este proveedor, nombre, medidas y pesos. Use Agregar stock para aumentar su existencia.',
            'WASTE_ALREADY_EXISTS',
            409
        );
        if (waste) this.meta = { waste };
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

export class WasteStockEntryDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al registrar la entrada de merma.', 'WASTE_STOCK_ENTRY_DB_ERROR', 500);
    }
}

export class WasteDeleteDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al eliminar la merma.', 'WASTE_DELETE_DB_ERROR', 500);
    }
}
