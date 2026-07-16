import { AppError } from "../AppError.js";

export class GoodsReceiptNotFound extends AppError {

    constructor() {
        super('Recibo de mercancía no encontrado', 'GOODS_RECEIPT_NOT_FOUND', 404);
    }
}

export class SupplierNotFound extends AppError {

    constructor() {
        super('Proveedor no encontrado', 'SUPPLIER_NOT_FOUND', 404);
    }
}

export class GoodsReceiptCreateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al crear la compra', 'GOODS_RECEIPT_CREATE_DB_ERROR', 500);
    }
}

export class ProfileReceivedByNotFound extends AppError {

    constructor() {
        super('Perfil de quien recibe no encontrado', 'PROFILE_RECEIVED_BY_NOT_FOUND', 404);
    }
}


export class GoodsReceiptUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al actualizar la compra', 'GOODS_RECEIPT_UPDATE_DB_ERROR', 500);
    }
}


export class GoodsReceiptSupplierChangeConflict extends AppError {

    constructor () {
        super('No se puede cambiar el proveedor de una compra confirmada porque sus movimientos de inventario ya están asociados al proveedor original', 'GOODS_RECEIPT_SUPPLIER_CHANGE_CONFLICT', 409);
    }
}

export class GoodsReceiptReturnConflict extends AppError {

    constructor () {
        super('La cantidad devuelta de la compra no es válida', 'GOODS_RECEIPT_RETURN_CONFLICT', 409);
    }
}

export class GoodsReceiptReturnQuantityExceeded extends AppError {

    constructor () {
        super('La cantidad devuelta excede la cantidad disponible para devolver en la compra', 'GOODS_RECEIPT_RETURN_QUANTITY_EXCEEDED', 409);
    }
}

export class GoodsReceiptReturnInsufficientStock extends AppError {

    constructor ({ productName, height, base, supplierName, productId, supplierId, requestedQuantity } = {}) {

        const hasDimensions =
            base != null &&
            height != null;

        const dimensions = hasDimensions
            ? ` (${ base } x ${ height })`
            : '';

        const supplier = supplierName
            ? ` y proveedor: ${ supplierName }`
            : '';

        super(
            `Stock insuficiente para devolver la compra con el producto: ${ productName ?? 'Producto desconocido' }${ dimensions }${ supplier }`,
            'GOODS_RECEIPT_RETURN_INSUFFICIENT_STOCK',
            409
        );

        this.meta = { productName, height, base, supplierName, productId, supplierId, requestedQuantity };
    }
}


export class GoodsReceiptCorrectionNoChanges extends AppError {

    constructor () {
        super('No hay cambios para aplicar en el detalle de la compra', 'GOODS_RECEIPT_CORRECTION_NO_CHANGES', 409);
    }
}

export class GoodsReceiptCorrectionQuantityConflict extends AppError {

    constructor () {
        super('La cantidad corregida del detalle debe estar entre cero y la cantidad registrada', 'GOODS_RECEIPT_CORRECTION_QUANTITY_CONFLICT', 409);
    }
}


export class GoodsReceiptCorrectionInsufficientStock extends AppError {

    constructor ({ productName, height, base, supplierName, productId, supplierId, requestedQuantity } = {}) {

        const hasDimensions =
            base != null &&
            height != null;

        const dimensions = hasDimensions
            ? ` (${ base } x ${ height })`
            : '';

        const supplier = supplierName
            ? ` y proveedor: ${ supplierName }`
            : '';

        super(
            `Stock insuficiente para corregir la compra con el producto: ${ productName ?? 'Producto desconocido' }${ dimensions }${ supplier }`,
            'GOODS_RECEIPT_CORRECTION_INSUFFICIENT_STOCK',
            409
        );

        this.meta = { productName, height, base, supplierName, productId, supplierId, requestedQuantity };
    }
}


export class GoodsReceiptCorrectionReasonNotFound extends AppError {

    constructor () {
        super('Razón de corrección de compra no encontrada', 'GOODS_RECEIPT_CORRECTION_REASON_NOT_FOUND', 404);
    }
}
