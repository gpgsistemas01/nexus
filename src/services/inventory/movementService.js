import { MovementDetailRelationConflict } from "../../errors/inventory/movementError.js";
import { GoodsIssueInexistentStock } from "../../errors/inventory/stockError.js";
import { getDb } from "../../repository/baseRepository.js";
import { buildStockKey, hasMaterialDimensions, normalizeDecimal, parseStockKey } from "../../utils/formattersUtils.js";
import { assertSufficientStock, calculateConvertedQuantity } from "./stockHelpers.js";
import { buildInventoryMovementDetail, buildStockUpdateSummary } from "./movementHelpers.js";
import { findSupplierMaterialsForStockMovement, updateSupplierMaterialStock } from "../warehouse/materials/supplierMaterialService.js";
import { INVENTORY_MOVEMENT_TYPES } from "../../constants/inventory.js";

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

    for (const detail of details) {

        if (!detail.materialId || !detail.supplierId) {
            throw new MovementDetailRelationConflict();
        }
    }

    const stockUpdateSummary = buildStockUpdateSummary({ details });

    const movementSupplierMaterials = supplierMaterials ?? await findSupplierMaterialsForStockMovement({
        tx,
        where: {
            OR: Array.from(stockUpdateSummary.stockKeys).map(parseStockKey)
        }
    });

    const psMap = new Map(
        movementSupplierMaterials.map(ps => [
            buildStockKey(ps.materialId, ps.supplierId),
            ps
        ])
    );

    const movementDetails = details.map(detail => {

        const key = buildStockKey(detail.materialId, detail.supplierId);

        const ps = psMap.get(key);

        if (!ps) {

            throw new GoodsIssueInexistentStock({
                materialName: ps?.material?.name ?? 'Material desconocido',
                height: ps?.material?.height ?? 'Desconocido',
                base: ps?.material?.base ?? 'Desconocido',
                supplierName: ps?.supplier?.tradeName ?? 'Proveedor desconocido'
            });
        }

        const base = Number(ps.material.base || 0);

        const height = Number(ps.material.height || 0);

        const hasDimensions = hasMaterialDimensions(ps.material);

        const quantity = normalizeDecimal(detail.quantity);

        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base,
            height
        });

        const previousStock = normalizeDecimal(ps.currentStock || 0);

        const previousConvertedQuantity = normalizeDecimal(
            ps.convertedQuantity || 0
        );

        const isOut = movementType === INVENTORY_MOVEMENT_TYPES.ISSUE;

        const signedQuantity = normalizeDecimal(
            isOut
                ? -quantity
                : quantity
        );

        const signedConvertedQuantity = normalizeDecimal(
            isOut
                ? -convertedQuantity
                : convertedQuantity
        );

        const newStock = normalizeDecimal(
            previousStock + signedQuantity
        );

        const newConverted = normalizeDecimal(
            previousConvertedQuantity + signedConvertedQuantity
        );

        if (isOut) {
            assertSufficientStock({
                material: {
                    ...ps.material,
                    base: hasDimensions ? ps.material.base : null,
                    height: hasDimensions ? ps.material.height : null,
                    supplier: ps.supplier
                },
                newStock,
                requestedQuantity: quantity
            });
        }

        ps.currentStock = newStock;

        ps.convertedQuantity = newConverted;

        return buildInventoryMovementDetail({
            materialId: detail.materialId,
            supplierId: detail.supplierId,
            quantity: signedQuantity,
            previousStock,
            newStock,
            materialBase: hasDimensions ? base : null,
            materialHeight: hasDimensions ? height : null,
            goodsReceiptDetailId: detail.goodsReceiptDetailId,
            goodsIssueDetailId: detail.goodsIssueDetailId,
            stockAdjustmentDetailId: detail.stockAdjustmentDetailId
        });
    });

    const movement = await createInventoryMovement({
        tx,
        reference,
        details: movementDetails,
        movementType
    });

    await updateSupplierMaterialStock({
        tx,
        grouped: stockUpdateSummary.grouped,
        movementType,
        supplierMaterials: movementSupplierMaterials
    });

    return movement;
};
