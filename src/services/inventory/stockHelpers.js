import { GoodsIssueInsufficientStock } from '../../errors/inventory/stockError.js';
import { normalizeDecimal, toNumber } from '../../utils/formattersUtils.js';

export const hasDimensions = ({ base, height } = {}) => (
    Number(toNumber(base) || 0) > 0 &&
    Number(toNumber(height) || 0) > 0
);

export const calculateConvertedQuantity = ({
    quantity = null,
    currentStock = null,
    base = null,
    height = null,
    fallbackToQuantity = true
}) => {

    const stock = Number(toNumber(currentStock ?? quantity) || 0);

    if (!hasDimensions({ base, height })) {
        return fallbackToQuantity ? normalizeDecimal(stock) : 0;
    }

    return normalizeDecimal(
        stock * Number(toNumber(base) || 0) * Number(toNumber(height) || 0)
    );
};

const getStockErrorMeta = (product = {}) => ({
    productName: product.name ?? product.product?.name ?? 'Producto desconocido',
    productId: product.id ?? product.productId ?? product.product?.id,
    supplierId: product.supplierId ?? product.supplier?.id,
    height: product.height ?? product.product?.height ?? null,
    base: product.base ?? product.product?.base ?? null,
    supplierName: product.supplier?.tradeName ?? product.supplierName ?? 'Proveedor desconocido',
    requestedQuantity: product.requestedQuantity
});

export const assertSufficientStock = ({
    product,
    newStock,
    newConvertedQuantity = null,
    requestedQuantity = null
}) => {

    if (newStock >= 0 && (newConvertedQuantity === null || newConvertedQuantity >= 0)) return;

    throw new GoodsIssueInsufficientStock(getStockErrorMeta({
        ...product,
        requestedQuantity
    }));
};
