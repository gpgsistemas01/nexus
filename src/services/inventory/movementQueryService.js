import { MovementFindDatabaseError } from "../../errors/inventory/movementError.js";
import { getDb } from "../../repository/baseRepository.js";
import { formatDateLongWithTime } from "../../utils/formattersUtils.js";
import { createServiceLogger, logServiceError } from "../../utils/logger.js";

const serviceLogger = createServiceLogger('inventory.movementQueryService');


const REFERENCE_NUMBER_SELECT = {
    referenceNumber: true
};

const MOVEMENT_TYPE_NAMES = Object.freeze({
    ENTRY: 'Entrada',
    ISSUE: 'Salida',
    ADJUSTMENT: 'Ajuste',
    RETURN: 'Devolución'
});

const RETURN_MOVEMENT_TYPE = 'RETURN';

const MOVEMENT_DETAIL_SELECT = {
    id: true,
    quantity: true,
    previousStock: true,
    newStock: true,
    material: {
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
    goodsReceiptDetail: { select: { materialName: true } },
    goodsIssueDetail: { select: { materialName: true } },
    stockAdjustmentDetail: {
        select: {
            materialName: true,
        }
    },
    goodsIssueReturn: {
        select: {
            id: true
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
                material: {
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
                stockAdjustmentDetail: {
                    materialName: {
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


const resolveMaterialBase = (detail) => detail.material?.base ?? null;

const resolveMaterialHeight = (detail) => detail.material?.height ?? null;

const resolveMaterialName = (detail) =>
    detail.stockAdjustmentDetail?.materialName ??
    detail.goodsReceiptDetail?.materialName ??
    detail.goodsIssueDetail?.materialName ??
    detail.material?.name;

const resolveSupplierName = (detail) => detail.supplier?.tradeName;

const resolveMovementTypeName = (detail) => {

    if (detail.goodsIssueReturn) return MOVEMENT_TYPE_NAMES.RETURN;

    return MOVEMENT_TYPE_NAMES[detail.movement.type] ?? detail.movement.type;
};

const mapMovementDetail = (detail) => ({
    id: detail.id,

    date: formatDateLongWithTime(detail.movement.date),

    createdAt: formatDateLongWithTime(detail.movement.createdAt),

    type: resolveMovementTypeName(detail),

    materialName: resolveMaterialName(detail),

    materialBase: resolveMaterialBase(detail),

    materialHeight: resolveMaterialHeight(detail),

    supplierName: resolveSupplierName(detail),

    quantity: detail.quantity,

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
    materialId = '',
    supplierId = '',
    goodsIssueId = '',
    goodsReceiptId = '',
    stockAdjustmentId = '',
    orderBy = 'referenceNumber',
    orderDir = 'desc',
}) => {

    const db = getDb();

    try {

        const isReturnMovementFilter = movementType === RETURN_MOVEMENT_TYPE;

        const movementFilters = {
            ...(movementType && {
                type: isReturnMovementFilter ? 'ENTRY' : movementType
            }),
            ...(goodsIssueId && { goodsIssueId }),
            ...(goodsReceiptId && { goodsReceiptId }),
            ...(stockAdjustmentId && { stockAdjustmentId }),
            ...getMovementDateFilter({ startDate, endDate })
        };

        const where = {

            ...(materialId && {
                materialId
            }),

            ...(supplierId && {
                supplierId
            }),

            ...(isReturnMovementFilter && {
                goodsIssueReturn: {
                    isNot: null
                }
            }),

            ...(movementType === 'ENTRY' && {
                goodsIssueReturn: {
                    is: null
                }
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
        logServiceError(serviceLogger, err, { operation: 'inventory.movementQueryService' });

        throw new MovementFindDatabaseError();
    }
}
