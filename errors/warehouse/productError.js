import e from "express";
import { AppError } from "../AppError.js";

export class ProductNotFound extends AppError {

    constructor () {
        super('Producto no encontrado', 'PRODUCT_NOT_FOUND', 404);
    }
}

export class ExcededMaxRetriesSkuError extends AppError {

    constructor () {
        super('Excedido el número máximo de intentos para generar un SKU único', 'EXCEDED_MAX_RETRIES_SKU', 500);
    }
}

export class SupplierProductCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al relacionar el producto a un proveedor', 'SUPPLIER_PRODUCT_CREATE_DB_ERROR', 500);
    }
}

export class SupplierProductDeleteDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al eliminar la relación entre producto y proveedor', 'SUPPLIER_PRODUCT_DELETE_DB_ERROR', 500);
    }
}

export class ProductAreaFindDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al buscar el área del producto', 'PRODUCT_AREA_FIND_DB_ERROR', 500);
    }
}

export class ProductCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al crear el producto', 'PRODUCT_CREATE_DB_ERROR', 500);
    }
}

export class ProductUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el producto', 'PRODUCT_UPDATE_DB_ERROR', 500);
    }
}

export class ProductQuantityUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar la cantidad del producto', 'PRODUCT_QUANTITY_UPDATE_DB_ERROR', 500);
    }
}

export class ProductCurrentStockUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al editar el stock actual del producto', 'PRODUCT_CURRENT_STOCK_UPDATE_DB_ERROR', 500);
    }
}