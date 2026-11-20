import { GoodsIssueInsufficientStock, InventoryPieceQuantityConflict } from '../../errors/inventory/stockError.js';
import { getPieceQuantityError } from '../../shared/inventory/pieceQuantity.js';

export const assertPieceQuantity = ({ quantity, item }) => {
    if (getPieceQuantityError(quantity, item?.presentation?.name)) {
        throw new InventoryPieceQuantityConflict();
    }
};

const getStockErrorMeta = (material = {}) => ({
    materialName: material.name ?? material.material?.name ?? 'Material desconocido',
    materialId: material.material?.id ?? material.materialId ?? material.id,
    supplierId: material.supplierId ?? material.supplier?.id,
    height: material.height ?? material.material?.height ?? null,
    base: material.base ?? material.material?.base ?? null,
    supplierName: material.supplier?.tradeName ?? material.supplierName ?? 'Proveedor desconocido',
    requestedQuantity: material.requestedQuantity
});

export const assertSufficientStock = ({
    material,
    newStock,
    newConvertedQuantity = null,
    requestedQuantity = null
}) => {

    if (newStock >= 0 && (newConvertedQuantity === null || newConvertedQuantity >= 0)) return;

    throw new GoodsIssueInsufficientStock(getStockErrorMeta({
        ...material,
        requestedQuantity
    }));
};
