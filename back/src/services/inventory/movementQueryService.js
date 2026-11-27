import { findPage } from '../../repository/paginationRepository.js';
import {
    findInventoryMovementCosts, findInventoryMovementDatePage, findWasteMovementCosts, findWasteMovementDatePage
} from '../../repository/warehouse/movementRepository.js';
import { MovementFindDatabaseError } from "../../errors/inventory/movementError.js";
import { getDb } from "../../repository/baseRepository.js";
import { buildDateRangeFilter } from "../../utils/requestQueryUtils.js";
import { formatDateLongWithTime } from '../../utils/formattersUtils.js';
import { MATERIAL_TYPES } from '../../shared/constants/inventory.js';
import { createServiceLogger, logServiceError } from "../../utils/logger.js";
import { getMaterialDetailSpecification, materialDetailTypeWhere } from '../warehouse/materials/materialDocumentSnapshot.js';

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
    materialSpecification: true,
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

const WASTE_MOVEMENT_DETAIL_SELECT = {
    id: true,
    quantity: true,
    previousStock: true,
    newStock: true,
    waste: {
        select: {
            name: true,
            base: true,
            height: true,
            supplier: { select: { tradeName: true } }
        }
    },
    wasteIssueReturn: { select: { id: true } },
    movement: {
        select: {
            type: true,
            date: true,
            createdAt: true,
            referenceNumber: true,
            wasteIssue: { select: REFERENCE_NUMBER_SELECT },
            wasteStockAdjustment: { select: REFERENCE_NUMBER_SELECT },
            wasteStockEntry: { select: REFERENCE_NUMBER_SELECT }
        }
    }
};

const getMovementDateFilter = ({ startDate, endDate }) => buildDateRangeFilter({
    field: 'date',
    startDate,
    endDate
});

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

const resolveMaterialBase = (detail) => getMaterialDetailSpecification(detail)?.base ?? null;

const resolveMaterialHeight = (detail) => getMaterialDetailSpecification(detail)?.height ?? null;

const resolveMaterialName = (detail) => detail.material?.name;

const resolveSupplierName = (detail) => detail.supplier?.tradeName;

const resolveMovementTypeName = (detail) => {

    if (detail.goodsIssueReturn) return MOVEMENT_TYPE_NAMES.RETURN;

    return MOVEMENT_TYPE_NAMES[detail.movement.type] ?? detail.movement.type;
};

const movementCostFields = (id, costs, linkedDocument) => {
    if (!costs) return {};
    const unitCost = costs.get(id) ?? null;
    return unitCost !== null || linkedDocument ? { unitCost } : {};
};

const mapMovementDetail = (detail, costs) => ({
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

    ...movementCostFields(detail.id, costs, detail.movement.goodsReceipt || detail.movement.goodsIssue),

    referenceNumber:
        detail.movement.goodsIssue?.referenceNumber ||
        detail.movement.goodsReceipt?.referenceNumber ||
        detail.movement.stockAdjustment?.referenceNumber ||
        detail.movement.referenceNumber
});

const mapWasteMovementDetail = (detail, costs) => ({
    id: detail.id,
    date: formatDateLongWithTime(detail.movement.date),
    createdAt: formatDateLongWithTime(detail.movement.createdAt),
    type: detail.wasteIssueReturn
        ? MOVEMENT_TYPE_NAMES.RETURN
        : MOVEMENT_TYPE_NAMES[detail.movement.type] ?? detail.movement.type,
    referenceNumber:
        detail.movement.wasteIssue?.referenceNumber ||
        detail.movement.wasteStockAdjustment?.referenceNumber ||
        detail.movement.wasteStockEntry?.referenceNumber ||
        detail.movement.referenceNumber,
    materialName: detail.waste.name,
    materialBase: detail.waste.base,
    materialHeight: detail.waste.height,
    supplierName: detail.waste.supplier.tradeName,
    previousStock: detail.previousStock,
    quantity: detail.quantity,
    newStock: detail.newStock,
    ...movementCostFields(detail.id, costs, detail.movement.wasteIssue)
});

const getWasteMovementSearchFilter = (search) => !search ? {} : ({
    OR: [
        { waste: { name: { contains: search, mode: 'insensitive' } } },
        { waste: { supplier: { tradeName: { contains: search, mode: 'insensitive' } } } },
        { movement: { referenceNumber: { contains: search, mode: 'insensitive' } } },
        { movement: { wasteIssue: { referenceNumber: { contains: search, mode: 'insensitive' } } } },
        { movement: { wasteStockAdjustment: { referenceNumber: { contains: search, mode: 'insensitive' } } } },
        { movement: { wasteStockEntry: { referenceNumber: { contains: search, mode: 'insensitive' } } } }
    ]
});

const findInventoryMovements = async ({
    type,
    canReadCosts = false,
    includeCounts = true,
    cursor,
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
        const dateFilter = getMovementDateFilter({ startDate, endDate });
        const onlyDate = !(search || materialId || supplierId || movementType || goodsIssueId || goodsReceiptId || stockAdjustmentId);

        const movementFilters = {
            ...(movementType && {
                type: isReturnMovementFilter ? 'ENTRY' : movementType
            }),
            ...(goodsIssueId && { goodsIssueId }),
            ...(goodsReceiptId && { goodsReceiptId }),
            ...(stockAdjustmentId && { stockAdjustmentId }),
            ...dateFilter
        };
        const where = {

            AND: [materialDetailTypeWhere(type), getMovementSearchFilter(search)],

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

            ...(Object.keys(movementFilters).length > 0 && {
                movement: movementFilters
            })
        };

        return await findPage({
            model: db.movementDetail,
            totalWhere: materialDetailTypeWhere(type),
            hasFilters: Boolean(search || materialId || supplierId || Object.keys(movementFilters).length),
            includeCounts,
            fetchPage: includeCounts && !cursor && take > 0 && orderBy === 'date' && onlyDate
                ? query => findInventoryMovementDatePage({ db, query, type, dateRange: dateFilter.date, orderDir })
                : undefined,
            mapData: async rows => {
                const costs = canReadCosts && await findInventoryMovementCosts({ db, ids: rows.map(detail => detail.id) });
                return rows.map(detail => mapMovementDetail(detail, costs));
            },
            query: {
                skip,
                take,
                ...(cursor && { cursor }),
                orderBy: [{ movement: { [orderBy]: orderDir } }, { id: 'asc' }],
                where,
                select: MOVEMENT_DETAIL_SELECT
            }
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'inventory.findInventoryMovements', inventoryType: type });

        throw new MovementFindDatabaseError();
    }
}

export const findAllMaterialMovements = (options = {}) => findInventoryMovements({ ...options, type: MATERIAL_TYPES.MATERIAL });
export const findAllConsumableMovements = (options = {}) => findInventoryMovements({ ...options, type: MATERIAL_TYPES.CONSUMABLE });

export const findAllWasteMovements = async ({
    canReadCosts = false,
    includeCounts = true,
    cursor,
    skip = 0,
    take = 10,
    startDate = '',
    endDate = '',
    movementType = '',
    search = '',
    wasteId = '',
    supplierId = '',
    orderBy = 'date',
    orderDir = 'desc'
} = {}) => {
    const db = getDb();

    try {
        const isReturnMovementFilter = movementType === RETURN_MOVEMENT_TYPE;
        const dateFilter = getMovementDateFilter({ startDate, endDate });
        const onlyDate = !(search || wasteId || supplierId || movementType);
        const where = {
            ...(wasteId && { wasteId }),
            ...(supplierId && { waste: { supplierId } }),
            ...(isReturnMovementFilter && { wasteIssueReturn: { isNot: null } }),
            ...(movementType === 'ENTRY' && { wasteIssueReturn: { is: null } }),
            ...getWasteMovementSearchFilter(search),
            movement: {
                ...(movementType && { type: isReturnMovementFilter ? 'ENTRY' : movementType }),
                ...dateFilter
            }
        };
        return await findPage({
            model: db.wasteMovementDetail,
            hasFilters: Boolean(search || wasteId || supplierId || movementType || startDate || endDate),
            includeCounts,
            fetchPage: includeCounts && !cursor && take > 0 && orderBy === 'date' && onlyDate
                ? query => findWasteMovementDatePage({ db, query, dateRange: dateFilter.date, orderDir })
                : undefined,
            mapData: async rows => {
                const costs = canReadCosts && await findWasteMovementCosts({ db, ids: rows.map(detail => detail.id) });
                return rows.map(detail => mapWasteMovementDetail(detail, costs));
            },
            query: {
                skip,
                take,
                ...(cursor && { cursor }),
                orderBy: [{ movement: { [orderBy]: orderDir } }, { id: 'asc' }],
                where,
                select: WASTE_MOVEMENT_DETAIL_SELECT
            }
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'inventory.findAllWasteMovements' });
        throw new MovementFindDatabaseError();
    }
};
