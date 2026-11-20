import { normalizeDecimal } from '../utils/numberUtils.js';

const hasDimensions = ({ base, height }) =>
    Number(base) > 0 && Number(height) > 0;

/** @param {{ quantity?: number | string | null, currentStock?: number | string | null, base?: number | string | null, height?: number | string | null, fallbackToQuantity?: boolean }} values */
export const calculateConvertedQuantity = ({
    quantity = null,
    currentStock = null,
    base = null,
    height = null,
    fallbackToQuantity = true
}) => {
    const stock = Number(currentStock ?? quantity) || 0;

    if (!hasDimensions({ base, height })) {
        return fallbackToQuantity ? normalizeDecimal(stock) : 0;
    }

    return normalizeDecimal(stock * Number(base) * Number(height));
};
