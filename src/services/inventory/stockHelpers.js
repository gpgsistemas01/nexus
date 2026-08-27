import { GoodsIssueInsufficientStock } from '../../errors/inventory/stockError.js';
import { normalizeDecimal, toNumber } from '../../utils/formattersUtils.js';

export const hasDimensions = ({ base, height } = {}) => (
    (toNumber(base) || 0) > 0 &&
    (toNumber(height) || 0) > 0
);

export const calculateConvertedQuantity = ({
    quantity = null,
    currentStock = null,
    base = null,
    height = null,
    fallbackToQuantity = true
}) => {

    const stock = toNumber(currentStock ?? quantity) || 0;

    if (!hasDimensions({ base, height })) {
        return fallbackToQuantity ? normalizeDecimal(stock) : 0;
    }

    return normalizeDecimal(
        stock * (toNumber(base) || 0) * (toNumber(height) || 0)
    );
};

const getStockErrorMeta = (material = {}) => ({
    materialName: material.name ?? material.material?.name ?? 'Material desconocido',
    materialId: material.id ?? material.materialId ?? material.material?.id,
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
