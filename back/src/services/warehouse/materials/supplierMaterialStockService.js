import { GoodsIssueInexistentStock, GoodsIssueInsufficientStock } from '../../../errors/inventory/stockError.js';
import { buildStockKey } from '../../../utils/formattersUtils.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { updateSupplierMaterialStocks } from '../../../repository/warehouse/stockUpdateRepository.js';
import { calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';

export const findSupplierMaterialsForStockMovement = ({ tx, where }) => tx.supplierMaterial.findMany({
    where,
    select: {
        materialId: true,
        supplierId: true,
        material: { select: { base: true, height: true, name: true } },
        supplier: { select: { tradeName: true } }
    }
});

const buildStockErrorMeta = (offer = {}, requestedQuantity) => ({
    materialName: offer.material?.name ?? 'Material desconocido',
    materialId: offer.materialId,
    supplierId: offer.supplierId,
    base: offer.material?.base ?? null,
    height: offer.material?.height ?? null,
    supplierName: offer.supplier?.tradeName ?? 'Proveedor desconocido',
    requestedQuantity
});

export const updateSupplierMaterialStock = async ({
    tx,
    grouped,
    movementType,
    supplierMaterialsByKey
}) => {
    const isIssue = movementType === INVENTORY_MOVEMENT_TYPES.ISSUE;
    const changes = Array.from(grouped, ([key, quantity]) => {
        const offer = supplierMaterialsByKey.get(key);
        if (!offer) throw new GoodsIssueInexistentStock(buildStockErrorMeta());

        const quantityChange = isIssue ? -quantity : quantity;
        return {
            materialId: offer.materialId,
            supplierId: offer.supplierId,
            quantityChange,
            convertedQuantityChange: calculateConvertedQuantity({ quantity: quantityChange, ...offer.material })
        };
    });
    const rows = await updateSupplierMaterialStocks({ tx, changes });
    const balances = new Map(rows.map(row => [buildStockKey(row.materialId, row.supplierId), row]));

    for (const change of changes) {
        const key = buildStockKey(change.materialId, change.supplierId);
        const updated = balances.get(key);
        if (!updated) {
            throw new GoodsIssueInsufficientStock(buildStockErrorMeta(supplierMaterialsByKey.get(key), Math.abs(change.quantityChange)));
        }

        const newStock = normalizeDecimal(updated.currentStock);
        balances.set(key, { previousStock: normalizeDecimal(newStock - change.quantityChange), newStock });
    }

    return balances;
};

export const adjustSupplierMaterialStock = ({
    tx,
    materialId,
    supplierId,
    newStock,
    newConvertedQuantity
}) => (
    tx.supplierMaterial.update({
        where: { supplierId_materialId: { materialId, supplierId } },
        data: { currentStock: newStock, convertedQuantity: newConvertedQuantity }
    })
);
