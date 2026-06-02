import { MovementFindDatabaseError } from "../../errors/inventory/movementError.js";
import { getDb } from "../../repository/baseRepository.js";
import { formatDateLongWithTime } from "../../utils/formattersUtils.js";

const REFERENCE_NUMBER_SELECT = {
    referenceNumber: true
};

const MOVEMENT_DETAIL_SELECT = {
    id: true,
    productBase: true,
    productHeight: true,
    quantity: true,
    previousConvertedQuantity: true,
    convertedQuantity: true,
    newConvertedQuantity: true,
    previousStock: true,
    newStock: true,
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
    },
    goodsReceiptDetail: {
        select: {
            productBase: true,
            productHeight: true
        }
    },
    goodsIssueDetail: {
        select: {
            productBase: true,
            productHeight: true
        }
    },
    stockAdjustmentDetail: {
        select: {
            productBase: true,
            productHeight: true
        }
    },
    movement: {
        select: {
            id: true,
            type: true,
            date: true,
            createdAt: true,
            referenceNumber: true,
            goodsIssue: {
                select: REFERENCE_NUMBER_SELECT
            },
            goodsReceipt: {
                select: REFERENCE_NUMBER_SELECT
            },
            stockAdjustment: {
                select: REFERENCE_NUMBER_SELECT
            }
        }
    }
};

const getMovementDateFilter = ({ startDate, endDate }) => {

    if (!startDate && !endDate) return {};

    return {
        date: {
            ...(startDate && {
                gte: new Date(startDate)
            }),
            ...(endDate && (() => {

                const nextDay = new Date(endDate);
                nextDay.setDate(nextDay.getDate() + 1);

                return {
                    lt: nextDay
                };
            })())
        }
    };
};

const getMovementSearchFilter = (search) => {

    if (!search) return {};

    return {
        OR: [
            {
                product: {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                supplier: {
                    tradeName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                movement: {
                    referenceNumber: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            },
            {
                movement: {
                    goodsIssue: {
                        referenceNumber: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            },
            {
                movement: {
                    goodsReceipt: {
                        referenceNumber: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            },
            {
                movement: {
                    stockAdjustment: {
                        referenceNumber: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        ]
    };
};

const resolveProductBase = (detail) =>
    detail.productBase ??
    detail.stockAdjustmentDetail?.productBase ??
    detail.goodsReceiptDetail?.productBase ??
    detail.goodsIssueDetail?.productBase ??
    detail.product?.base ??
    null;

const resolveProductHeight = (detail) =>
    detail.productHeight ??
    detail.stockAdjustmentDetail?.productHeight ??
    detail.goodsReceiptDetail?.productHeight ??
    detail.goodsIssueDetail?.productHeight ??
    detail.product?.height ??
    null;

const mapMovementDetail = (detail) => ({
    id: detail.id,

    date: formatDateLongWithTime(detail.movement.date),

    createdAt: formatDateLongWithTime(detail.movement.createdAt),

    type: detail.movement.type,

    productName: detail.product.name,

    productBase: resolveProductBase(detail),

    productHeight: resolveProductHeight(detail),

    supplierName: detail.supplier?.tradeName,

    quantity: detail.quantity,

    previousConvertedQuantity: detail.previousConvertedQuantity,

    convertedQuantity: detail.convertedQuantity,

    newConvertedQuantity: detail.newConvertedQuantity,

    previousStock: detail.previousStock,

    newStock: detail.newStock,

    referenceNumber:
        detail.movement.goodsIssue?.referenceNumber ||
        detail.movement.goodsReceipt?.referenceNumber ||
        detail.movement.stockAdjustment?.referenceNumber ||
        detail.movement.referenceNumber
});

export const findAllMovements = async ({
    skip = 0,
    take = 10,
    startDate = '',
    endDate = '',
    movementType = '',
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

    try {

        const movementFilters = {
            ...(movementType && { type: movementType }),
            ...(goodsIssueId && { goodsIssueId }),
            ...(goodsReceiptId && { goodsReceiptId }),
            ...(stockAdjustmentId && { stockAdjustmentId }),
            ...getMovementDateFilter({ startDate, endDate })
        };

        const where = {

            ...(productId && {
                productId
            }),

            ...(supplierId && {
                supplierId
            }),

            ...getMovementSearchFilter(search),

            ...(Object.keys(movementFilters).length > 0 && {
                movement: movementFilters
            })
        };

        const movements = await db.movementDetail.findMany({
            skip,
            take,
            orderBy: {
                movement: {
                    [orderBy]: orderDir
                }
            },
            where,
            select: MOVEMENT_DETAIL_SELECT
        });

        const total = await db.movementDetail.count();
        const filtered = await db.movementDetail.count({ where });

        return {
            data: movements.map(mapMovementDetail),
            recordsTotal: total,
            recordsFiltered: filtered
        };

    } catch (err) {

        throw new MovementFindDatabaseError();
    }
}
