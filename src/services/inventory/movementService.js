import { MovementDetailRelationConflict } from "../../errors/inventory/movementError.js";
import { GoodsIssueInexistentStock } from "../../errors/inventory/stockError.js";
import { getDb } from "../../repository/baseRepository.js";
import { buildStockKey, hasProductDimensions, normalizeDecimal, parseStockKey } from "../../utils/formattersUtils.js";
import { assertSufficientStock, calculateConvertedQuantity } from "./stockHelpers.js";
import { buildInventoryMovementDetail, buildStockUpdateSummary } from "./movementHelpers.js";
import { findSupplierProductsForStockMovement, updateSupplierProductStock } from "../warehouse/products/supplierProductService.js";
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
            details: {
                create: details
            }
        },
        include: {
            details: true
        }
    });
};


export const applyInventoryMovement = async ({
    tx,
    reference = {},
    details,
    movementType,
    supplierProducts
}) => {

    for (const detail of details) {

        if (!detail.productId || !detail.supplierId) {
            throw new MovementDetailRelationConflict();
        }
    }

    const stockUpdateSummary = buildStockUpdateSummary({ details });

    const movementSupplierProducts = supplierProducts ?? await findSupplierProductsForStockMovement({
        tx,
        where: {
            OR: Array.from(stockUpdateSummary.stockKeys).map(parseStockKey)
        }
    });

    const psMap = new Map(
        movementSupplierProducts.map(ps => [
            buildStockKey(ps.productId, ps.supplierId),
            ps
        ])
    );

    const movementDetails = details.map(detail => {

        const key = buildStockKey(detail.productId, detail.supplierId);

        const ps = psMap.get(key);

        if (!ps) {

            throw new GoodsIssueInexistentStock({
                productName: ps?.product?.name ?? 'Producto desconocido',
                height: ps?.product?.height ?? 'Desconocido',
                base: ps?.product?.base ?? 'Desconocido',
                supplierName: ps?.supplier?.tradeName ?? 'Proveedor desconocido'
            });
        }

        const base = Number(ps.product.base || 0);

        const height = Number(ps.product.height || 0);

        const hasDimensions = hasProductDimensions(ps.product);

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
                product: {
                    ...ps.product,
                    base: hasDimensions ? ps.product.base : null,
                    height: hasDimensions ? ps.product.height : null,
                    supplier: ps.supplier
                },
                newStock,
                requestedQuantity: quantity
            });
        }

        /**
         * MUY IMPORTANTE:
         * actualizamos el estado local
         * para acumulaciones dentro
         * de la misma transacción
         */
        ps.currentStock = newStock;

        ps.convertedQuantity = newConverted;

        return buildInventoryMovementDetail({
            productId: detail.productId,
            supplierId: detail.supplierId,
            quantity: signedQuantity,
            previousStock,
            newStock,
            productBase: hasDimensions ? base : null,
            productHeight: hasDimensions ? height : null,
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

    await updateSupplierProductStock({
        tx,
        grouped: stockUpdateSummary.grouped,
        movementType,
        supplierProducts: movementSupplierProducts
    });

    return movement;
};
