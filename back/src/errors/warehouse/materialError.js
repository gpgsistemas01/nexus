import { AppError } from "../AppError.js";

export class MaterialRollReferenceReadOnly extends AppError {
    constructor() {
        super('Los pesos de referencia registrados no se pueden modificar ni eliminar.', 'MATERIAL_ROLL_REFERENCE_READ_ONLY', 409);
    }
}

export class MaterialNotFound extends AppError {

    constructor () {
        super('Material no encontrado', 'MATERIAL_NOT_FOUND', 404);
    }
}

export class MaterialInactiveConflict extends AppError {

    constructor () {
        super('El material está inactivo y no puede utilizarse en una operación nueva', 'MATERIAL_INACTIVE_CONFLICT', 409);
    }
}

export class MaterialAlreadyExists extends AppError {

    constructor () {
        super(
            'Ya existe un material con el mismo nombre, presentación, unidad de medida y dimensiones.',
            'MATERIAL_ALREADY_EXISTS',
            409
        );
    }
}

export class ExcededMaxRetriesSkuError extends AppError {

    constructor () {
        super('Excedido el número máximo de intentos para generar un SKU único', 'EXCEDED_MAX_RETRIES_SKU', 500);
    }
}

export class MaterialCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al crear el material', 'MATERIAL_CREATE_DB_ERROR', 500);
    }
}

export class MaterialInitialStockReasonNotFound extends AppError {

    constructor () {
        super('Razón de stock inicial no encontrada para registrar el material.', 'MATERIAL_INITIAL_STOCK_REASON_NOT_FOUND', 404);
    }
}

export class MaterialUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el material', 'MATERIAL_UPDATE_DB_ERROR', 500);
    }
}

export class MaterialDeleteDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al eliminar la relación entre el material y el proveedor', 'MATERIAL_DELETE_DB_ERROR', 500);
    }
}

export class MaterialDeleteRelationConflict extends AppError {

    constructor () {
        super(
            'No se puede eliminar la relación entre el material y el proveedor porque el material tiene historial de compras, salidas, mermas, movimientos o ajustes de stock.',
            'MATERIAL_DELETE_RELATION_CONFLICT',
            409
        );
    }
}

export class MaterialStockAdjustmentDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el ajuste de stock del material', 'MATERIAL_STOCK_ADJUSTMENT_DB_ERROR', 500);
    }
}
