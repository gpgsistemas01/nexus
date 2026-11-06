import { AppError } from "../AppError.js";
import { PIECE_QUANTITY_MESSAGE } from '../../shared/inventory/pieceQuantity.js';

export class InventoryPieceQuantityConflict extends AppError {
    constructor() {
        super(PIECE_QUANTITY_MESSAGE, 'INVENTORY_PIECE_QUANTITY_REQUIRED', 409);
    }
}

export class GoodsIssueInsufficientStock extends AppError {

    constructor ({ materialName, height, base, supplierName, materialId, supplierId, requestedQuantity }) {

        const hasDimensions =
            base != null &&
            height != null;

        const dimensions = hasDimensions
            ? ` (${ base } x ${ height })`
            : '';

        const supplier = supplierName
            ? supplierName
            : '';

        super(
            `Stock insuficiente para realizar la salida con el material: ${ materialName } (${ dimensions }) y proveedor: ${ supplier }`,
            'GOODS_ISSUE_INSUFFICIENT_STOCK',
            409
        );

        this.meta = { materialName, height, base, supplierName, materialId, supplierId, requestedQuantity };
    }
}

export class GoodsIssueInexistentStock extends AppError {

    constructor ({ materialName, height, base, supplierName, materialId, supplierId }) {

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
            `Stock inexistente para realizar la salida del material: ${ materialName }${ dimensions }${ supplier }`,
            'GOODS_ISSUE_INEXISTENT_STOCK',
            409
        );

        this.meta = {
            materialName,
            height,
            base,
            supplierName,
            materialId,
            supplierId
        };
    }
}

export class GoodsIssueMissingMaxUnitCost extends AppError {

    constructor ({ materialName, height, base, supplierName }) {
        const dimensions = base != null && height != null ? ` (${ base } x ${ height })` : '';
        const supplier = supplierName ? `, proveedor: ${ supplierName }` : '';
        super(
            `Configure un costo unitario máximo mayor que cero en Almacén antes de usar: ${ materialName }${ dimensions }${ supplier }.`,
            'GOODS_ISSUE_MISSING_MAX_UNIT_COST',
            409
        );

        this.meta = { materialName, height, base, supplierName };
    }
}
