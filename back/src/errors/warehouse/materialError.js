import { AppError } from "../AppError.js";

export class MaterialRollReferenceReadOnly extends AppError {
    constructor() {
        super('Los pesos de referencia registrados no se pueden modificar ni eliminar.', 'MATERIAL_ROLL_REFERENCE_READ_ONLY', 409);
    }
}

export class MaterialIdentityLinkedConflict extends AppError {
    constructor() {
        super('El artículo tiene proveedores vinculados. Sólo puede editar Nombre y Stock mínimo.', 'MATERIAL_IDENTITY_LINKED', 409);
    }
}

export class MaterialSpecificationChangedConflict extends AppError {
    constructor() {
        super('Las especificaciones de la partida histórica difieren de las del artículo vigente. La operación no puede modificar esta existencia.', 'MATERIAL_SPECIFICATION_CHANGED', 409);
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
        super('Error de base de datos al editar la oferta del proveedor', 'MATERIAL_UPDATE_DB_ERROR', 500);
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
            'No se puede eliminar la oferta del proveedor porque otro registro todavía la requiere.',
            'MATERIAL_DELETE_RELATION_CONFLICT',
            409
        );
    }
}

export class MaterialDeleteStockConflict extends AppError {
    constructor() {
        super('La oferta aún tiene existencias. Sólo se pueden eliminar ofertas con saldo cero y sin historial.', 'MATERIAL_DELETE_STOCK_CONFLICT', 409);
    }
}

export class MaterialDeleteHistoryConflict extends AppError {
    constructor() {
        super('La oferta tiene compras, salidas u otros registros de inventario. Puede desactivarla desde Editar oferta.', 'MATERIAL_DELETE_HISTORY_CONFLICT', 409);
    }
}

export class MaterialCatalogDeleteConflict extends AppError {
    constructor() {
        super('El artículo tiene proveedores vinculados o historial de inventario.', 'MATERIAL_CATALOG_DELETE_CONFLICT', 409);
    }
}

export class MaterialFieldsManagedInCatalog extends AppError {
    constructor() {
        super('El nombre y el stock mínimo se editan en Almacén → Artículos.', 'MATERIAL_FIELDS_MANAGED_IN_CATALOG', 409);
    }
}

export class MaterialStockAdjustmentDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el ajuste de stock del material', 'MATERIAL_STOCK_ADJUSTMENT_DB_ERROR', 500);
    }
}
