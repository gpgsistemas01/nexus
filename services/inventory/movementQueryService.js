import { MovementFindDatabaseError } from "../../errors/inventory/movementError.js";
import { getDb } from "../../repository/baseRepository.js";

export const findAllMovements = async ({
    skip = 0,
    take = 10,
    type = '',
    search = '',
    productId = '',
    supplierId = '',
    goodsIssueId = '',
    goodsReceiptId = '',
    stockAdjustmentId = '',
    orderBy = 'date',
    orderDir = 'asc',
}) => {

    const db = getDb();

    const where = {
        ...(productId && {
            details: {
                some: {
                    productId
                }
            }
        }),
        ...(supplierId && {
            details: {
                some: {
                    supplierId
                }
            }
        }),
        ...(goodsIssueId && {
            goodsIssueId
        }),
        ...(goodsReceiptId && {
            goodsReceiptId
        }),
        ...(stockAdjustmentId && {
            stockAdjustmentId
        }),
        ...(type && {
            type
        })
    }

    try {

        return await db.inventoryMovement.findMany({
            skip,
            take,
            where,
            orderBy: {
                [orderBy]: orderDir
            },
            include: {
                goodsIssue: {
                    select: {
                        referenceNumber: true
                    }
                },
                goodsReceipt: {
                    select: {
                        referenceNumber: true
                    }
                },
                details: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                base: true,
                                height: true
                            }
                        },
                        supplier: {
                            select: {
                                tradeName: true
                            }
                        }
                    }
                }
            }
        });

    } catch (err) {

        throw new MovementFindDatabaseError();
    }
}