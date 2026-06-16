import { MovementDetailRelationConflict } from "../../errors/inventory/movementError.js";
import { GoodsIssueInexistentStock } from "../../errors/inventory/stockError.js";
import { InventoryMovementType } from "../../generated/prisma/enums.ts";
import { getDb } from "../../repository/baseRepository.js";
import { buildStockKey, hasProductDimensions, normalizeDecimal } from "../../utils/formattersUtils.js";
import { assertSufficientStock, calculateConvertedQuantity } from "./stockHelpers.js";
import { updateSupplierProductStock } from "../warehouse/products/supplierProductService.js";

const REFERENCE_TYPE_GOODS_RECEIPT = 'GOODS_RECEIPT';
const REFERENCE_TYPE_GOODS_ISSUE = 'GOODS_ISSUE';
const REFERENCE_TYPE_PURCHASE_REQUISITION = 'PURCHASE_REQUISITION';
const MOVEMENT_TYPE_OUT = 'ISSUE';

export const applyInventoryMovement = async ({
    tx,
    reference = {},
    details,
    movementType,
    grouped,
    supplierProducts
}) => {

    for (const detail of details) {

        if (!detail.productId || !detail.supplierId) {
            throw new MovementDetailRelationConflict();
        }
    }

    const db = getDb(tx);

    const psMap = new Map(
        supplierProducts.map(ps => [
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

        const isOut = movementType === MOVEMENT_TYPE_OUT;

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

        return {
            productId: detail.productId,
            supplierId: detail.supplierId,

            quantity: signedQuantity,

            previousStock,
            newStock,

            productBase: hasDimensions ? base : null,
            productHeight: hasDimensions ? height : null,

            ...(detail.goodsReceiptDetailId && {
                goodsReceiptDetailId: detail.goodsReceiptDetailId
            }),

            ...(detail.goodsIssueDetailId && {
                goodsIssueDetailId: detail.goodsIssueDetailId
            }),

            ...(detail.stockAdjustmentDetailId && {
                stockAdjustmentDetailId: detail.stockAdjustmentDetailId
            })
        };
    });

    const movement = await db.inventoryMovement.create({
        data: {
            ...reference,
            type: movementType,
            details: {
                create: movementDetails
            }
        },
        include: {
            details: true
        }
    });

    await updateSupplierProductStock({
        tx,
        grouped,
        movementType,
        supplierProducts
    });

    return movement;
};

export const createStockAdjustmentMovement = async ({
    tx,
    adjustment,
    productId,
    supplierId,
    reasonId,
    previousStock,
    newStock,
    difference
}) => {

    const db = getDb(tx);

    const [adjustmentDetail] = adjustment.details;

    return await db.inventoryMovement.create({
        data: {
            type: InventoryMovementType.ADJUSTMENT,
            stockAdjustment: {
                connect: {
                    id: adjustment.id
                }
            },

            details: {
                create: {
                    quantity: difference,
                    newStock,
                    previousStock,
                    productBase: adjustmentDetail.productBase,
                    productHeight: adjustmentDetail.productHeight,
                    product: {
                        connect: {
                            id: productId
                        }
                    },
                    supplier: {
                        connect: {
                            id: supplierId
                        }
                    },
                    stockAdjustmentDetail: {
                        connect: {
                            id: adjustmentDetail.id
                        }
                    }
                }
            }
        }
    });
}
