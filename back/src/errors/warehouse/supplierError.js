import { AppError } from "../AppError.js";

export class SupplierNotFound extends AppError {

    constructor () {
        super('Proveedor no encontrado', 'SUPPLIER_NOT_FOUND', 404);
    }
}

export class SupplierInactiveConflict extends AppError {

    constructor () {
        super('El proveedor está inactivo y no puede utilizarse en una operación nueva', 'SUPPLIER_INACTIVE_CONFLICT', 409);
    }
}

export class SupplierCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al crear el proveedor', 'SUPPLIER_CREATE_DB_ERROR', 500);
    }
}

export class SupplierUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el proveedor', 'SUPPLIER_UPDATE_DB_ERROR', 500);
    }
}
