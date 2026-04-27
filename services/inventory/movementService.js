import { prisma } from "../../lib/prisma.js";

const REFERENCE_MOVEMENT_IN = 'IN';
const REFERENCE_TYPE_GOODS_RECEIPT = 'GOODS_RECEIPT';
const REFERENCE_TYPE_GOODS_ISSUE = 'GOODS_ISSUE';
const REFERENCE_TYPE_PURCHASE_REQUISITION = 'PURCHASE_REQUISITION';

export const applyInventoryMovement = async ({ 
    tx, 
    goodsReceiptId, 
    referenceType,
    details, 
    movementType 
}) => {

    const db = tx || prisma;

    const data = {};

    if (goodsReceiptId) {
        
        data.goodsReceiptId = goodsReceiptId;
        data.date = new Date();
        data.details = {
            create: details.map(detail => ({
                goodsReceiptDetailId: detail.id,
                productId: detail.productId,
                quantity: detail.quantity
            }))
        }
    };

    const movement = await db.inventoryMovement.create({
        data,
        include: {
            details: {
                select: {
                    productId: true,
                    quantity: true
                }
            }
        }
    });

    const grouped = [];

    for (const detail of movement.details) {
        grouped[detail.productId] = (grouped[detail.productId] || 0) + detail.quantity;
    }

    await Promise.all(
        Object.entries(grouped).map(([productId, quantity]) =>
            db.product.update({
                where: { id: productId },
                data: {
                    currentStock: {
                        [movementType === REFERENCE_MOVEMENT_IN ? 'increment' : 'decrement']: quantity
                    }
                }
            })
        )
    );

    return movement.details.map((detail) => detail.productId);
}
