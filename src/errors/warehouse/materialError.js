import { AppError } from "../AppError.js";

export class MaterialNotFound extends AppError {

    constructor () {
        super('Material no encontrado', 'MATERIAL_NOT_FOUND', 404);
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

export class SupplierMaterialCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al relacionar el material a un proveedor', 'SUPPLIER_MATERIAL_CREATE_DB_ERROR', 500);
    }
}

export class SupplierMaterialDeleteDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al eliminar la relación entre material y proveedor', 'SUPPLIER_MATERIAL_DELETE_DB_ERROR', 500);
    }
}

export class MaterialSnapshotFindDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al buscar los datos históricos del material', 'MATERIAL_SNAPSHOT_FIND_DB_ERROR', 500);
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
        super('Error de base de datos al eliminar el material', 'MATERIAL_DELETE_DB_ERROR', 500);
    }
}

export class MaterialDeleteRelationConflict extends AppError {

    constructor () {
        super('No se puede eliminar el material porque está vinculado a una compra, salida u otro movimiento de almacén.', 'MATERIAL_DELETE_RELATION_CONFLICT', 409);
    }
}

export class MaterialSupplierChangeConflict extends AppError {

    constructor () {
        super('No se puede cambiar el proveedor del material porque ya tiene historial de compras o salidas.', 'MATERIAL_SUPPLIER_CHANGE_CONFLICT', 409);
    }
}

export class MaterialStockAdjustmentDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el ajuste de stock del material', 'MATERIAL_STOCK_ADJUSTMENT_DB_ERROR', 500);
    }
}

export class MaterialUnitCostUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el costo unitario del material', 'MATERIAL_UNIT_COST_UPDATE_DB_ERROR', 500);
    }
}
