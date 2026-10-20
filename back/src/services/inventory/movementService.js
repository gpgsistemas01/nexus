import { getDb } from "../../repository/baseRepository.js";
import { buildStockKey, parseStockKey } from '../../utils/formattersUtils.js';
import { normalizeDecimal } from '../../shared/utils/numberUtils.js';
import { buildInventoryMovementDetail, buildStockUpdateSummary } from "./movementHelpers.js";
import {
    findSupplierMaterialsForStockMovement,
    updateSupplierMaterialStock
} from "../warehouse/materials/supplierMaterialStockService.js";
import { INVENTORY_MOVEMENT_TYPES } from '../../constants/inventory.js';

export const createInventoryMovement = ({
    tx = null,
    reference = {},
    details,
    movementType
}) => {
    const db = getDb(tx);

    return db.inventoryMovement.create({
        data: {
            ...reference,
            type: movementType,
            details: { create: details }
        },
        include: { details: true }
    });
};

export const applyInventoryMovement = async ({
    tx,
    reference = {},
    details,
    movementType,
    supplierMaterials
}) => {
    const { grouped } = buildStockUpdateSummary({ details });
    const offers = supplierMaterials ?? await findSupplierMaterialsForStockMovement({
        tx,
        where: { OR: [...grouped.keys()].map(parseStockKey) }
    });
    const supplierMaterialsByKey = new Map(offers.map(offer => [
        buildStockKey(offer.materialId, offer.supplierId),
        offer
    ]));
    const balances = await updateSupplierMaterialStock({ tx, grouped, movementType, supplierMaterialsByKey });
    const isIssue = movementType === INVENTORY_MOVEMENT_TYPES.ISSUE;
    const movementDetails = details.map(detail => {
        const key = buildStockKey(detail.materialId, detail.supplierId);
        const balance = balances.get(key);
        const quantity = normalizeDecimal(isIssue ? -detail.quantity : detail.quantity);
        const previousStock = balance.previousStock;
        const newStock = normalizeDecimal(previousStock + quantity);
        balance.previousStock = newStock;

        return buildInventoryMovementDetail({
            ...detail,
            quantity,
            previousStock,
            newStock
        });
    });

    return createInventoryMovement({ tx, reference, details: movementDetails, movementType });
};
