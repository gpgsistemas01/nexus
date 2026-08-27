import { AppError } from "../AppError.js";
import { buildGoodsReceiptInvoiceAlreadyExistsMessage } from "../../public/js/constants/goodsReceiptMessages.js";

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

export class GoodsReceiptInvoiceAlreadyExists extends AppError {

    constructor(existingGoodsReceipt = null) {
        super(
            buildGoodsReceiptInvoiceAlreadyExistsMessage({
                existingReferenceNumber: existingGoodsReceipt?.referenceNumber
            }),
            'GOODS_RECEIPT_INVOICE_ALREADY_EXISTS',
            409
        );

        this.meta = existingGoodsReceipt
            ? {
                existingGoodsReceiptId: existingGoodsReceipt.id,
                existingReferenceNumber: existingGoodsReceipt.referenceNumber
            }
            : undefined;
    }
}

export class PersonReceivedByNotFound extends AppError {

    constructor() {
        super('Persona que recibe no encontrada', 'PERSON_RECEIVED_BY_NOT_FOUND', 404);
    }
}


export class GoodsReceiptUpdateDatabaseError extends AppError {

    constructor () {
        super('Error de base de datos al actualizar la compra', 'GOODS_RECEIPT_UPDATE_DB_ERROR', 500);
    }
}

export class GoodsReceiptAlreadyCanceled extends AppError {

    constructor () {
        super('No se puede modificar una compra cancelada', 'GOODS_RECEIPT_ALREADY_CANCELED', 409);
    }
}


export class GoodsReceiptSupplierChangeConflict extends AppError {

    constructor () {
        super('No se puede cambiar el proveedor de una compra confirmada porque sus movimientos de inventario ya están asociados al proveedor original', 'GOODS_RECEIPT_SUPPLIER_CHANGE_CONFLICT', 409);
    }
}




export class GoodsReceiptCorrectionNoChanges extends AppError {

    constructor () {
        super('No hay cambios para aplicar en el detalle de la compra', 'GOODS_RECEIPT_CORRECTION_NO_CHANGES', 409);
    }
}

export class GoodsReceiptCorrectionQuantityConflict extends AppError {

    constructor () {
        super('La cantidad corregida del detalle debe ser mayor a cero y no exceder la cantidad registrada', 'GOODS_RECEIPT_CORRECTION_QUANTITY_CONFLICT', 409);
    }
}


export class GoodsReceiptCorrectionInsufficientStock extends AppError {

    constructor ({ materialName, height, base, supplierName, materialId, supplierId, requestedQuantity } = {}) {

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
            `Stock insuficiente para corregir la compra con el material: ${ materialName ?? 'Material desconocido' }${ dimensions }${ supplier }`,
            'GOODS_RECEIPT_CORRECTION_INSUFFICIENT_STOCK',
            409
        );

        this.meta = { materialName, height, base, supplierName, materialId, supplierId, requestedQuantity };
    }
}


export class GoodsReceiptDetailAlreadyCanceled extends AppError {

    constructor () {
        super('El detalle de la compra ya está cancelado', 'GOODS_RECEIPT_DETAIL_ALREADY_CANCELED', 409);
    }
}


export class GoodsReceiptDetailChangeReasonNotFound extends AppError {

    constructor () {
        super('Razón para modificar el detalle de compra no encontrada', 'GOODS_RECEIPT_DETAIL_CHANGE_REASON_NOT_FOUND', 404);
    }
}
