import { AppError } from "../AppError.js";

export class WasteRollReferenceInvalid extends AppError {
    constructor() {
        super('La referencia sólo aplica a materiales con presentación Rollo.', 'WASTE_ROLL_REFERENCE_INVALID', 400);
    }
}

export class WasteRollReferenceMissing extends AppError {
    constructor() {
        super('Complete la referencia del cono y del rollo para utilizarla en esta merma.', 'WASTE_ROLL_REFERENCE_MISSING', 400);
    }
}

export class WasteWeightReadOnly extends AppError {
    constructor() {
        super('No se pueden modificar los pesos de una merma ya registrada. Estos datos sólo están disponibles para consulta.', 'WASTE_WEIGHT_READ_ONLY', 400);
    }
}

export class WasteWeightInvalid extends AppError {
    constructor() {
        super('El peso debe ser positivo y sólo aplica a mermas con presentación Rollo.', 'WASTE_WEIGHT_INVALID', 400);
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
