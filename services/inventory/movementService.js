import { prisma } from "../../lib/prisma.js";
import { updateProductCurrentStock } from "../warehouse/products/productService.js";

const REFERENCE_TYPE_GOODS_RECEIPT = 'GOODS_RECEIPT';
const REFERENCE_TYPE_GOODS_ISSUE = 'GOODS_ISSUE';
const REFERENCE_TYPE_PURCHASE_REQUISITION = 'PURCHASE_REQUISITION';

export const applyInventoryMovement = async ({ 
    tx, 
    goodsReceiptId,
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

    await updateProductCurrentStock({
        tx,
        grouped,
        movementType
    });

    return movement.details.map((detail) => detail.productId);
}
