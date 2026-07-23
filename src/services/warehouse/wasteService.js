import { isAppError } from '../../errors/AppError.js';
import { WasteInitialStockReasonNotFound, WasteNotFound, WasteStockAdjustmentDatabaseError, WasteUpdateDatabaseError } from '../../errors/warehouse/wasteError.js';
import { getDb } from '../../repository/baseRepository.js';
import { toNumber } from '../../utils/formattersUtils.js';
import { calculateConvertedQuantity } from '../inventory/stockHelpers.js';
import { createStockAdjustmentByQuantityChange } from './adjustmentService.js';
import { findInitialStockAdjustmentReason } from './reasonService.js';
import { findSupplierProductById } from './products/supplierProductService.js';
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../constants/prisma.js";

const serviceLogger = createServiceLogger('warehouse.wasteService');



const handleWasteServiceError = ({ err, fallbackError }) => {

    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new WasteNotFound();
    }

    if (isAppError(err)) throw err;

    throw fallbackError;
};

const WASTE_INCLUDE = {
    supplierProduct: {
        select: {
            id: true,
            productId: true,
            supplierId: true,
            maxUnitCost: true,
            currentStock: true,
            convertedQuantity: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                    base: true,
                    height: true,
                    presentation: true,
                    unitMeasure: true
                }
            },
            supplier: {
                select: {
                    id: true,
                    tradeName: true
                }
            }
        }
    }
};

const mapWaste = (waste) => {

    const { supplierProduct } = waste;
    const { product, supplier } = supplierProduct || {};

    return {
        id: waste.id,
        supplierProductId: waste.supplierProductId,
        stockAdjustmentId: waste.stockAdjustmentId,
        supplierProduct: supplierProduct ? { ...supplierProduct } : null,
        productId: product?.id,
        productName: product?.name,
        name: product?.name,
        isActive: waste.isActive,
        base: waste.base,
        height: waste.height,
        productBase: product?.base,
        productHeight: product?.height,
        minStock: waste.minStock,
        currentStock: waste.currentStock,
        convertedQuantity: waste.convertedQuantity,
        maxUnitCost: supplierProduct?.maxUnitCost ?? null,
        presentation: product?.presentation ?? null,
        unitMeasure: product?.unitMeasure ?? null,
        product,
        supplier
    };
};

const findWasteById = async ({ tx, id }) => {

    const db = getDb(tx);

    const waste = await db.waste.findUnique({
        where: { id },
        include: WASTE_INCLUDE
    });

    if (!waste) throw new WasteNotFound();

    return waste;
};

const buildWasteStockData = ({
    currentStock,
    base,
    height
}) => ({
    currentStock,
    convertedQuantity: calculateConvertedQuantity({
        currentStock,
        base,
        height,
        fallbackToQuantity: false
    })
});

const adjustWasteStock = async ({
    tx,
    id,
    currentStock,
    base,
    height
}) => {

    const db = getDb(tx);

    return db.waste.update({
        where: { id },
        data: buildWasteStockData({
            currentStock,
            base,
            height
        }),
        include: WASTE_INCLUDE
    });
};

export const findAllWastes = async ({
    skip = 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = { AND: [] };

    if (search) where.AND.push({
        OR: [
            {
                supplierProduct: {
                    product: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            },
            {
                supplierProduct: {
                    supplier: {
                        tradeName: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        ]
    });

    if (supplierId) where.AND.push({
        supplierProduct: {
            supplierId
        }
    });

    if (where.AND.length === 0) delete where.AND;

    const orderMap = {
        name: { supplierProduct: { product: { name: orderDir } } },
        supplier: { supplierProduct: { supplier: { tradeName: orderDir } } }
    };

    const db = getDb();

    const wastes = await db.waste.findMany({
        skip,
        take,
        where,
        include: WASTE_INCLUDE,
        orderBy: orderMap[orderBy] || orderMap.name
    });
    const total = await db.waste.count();
    const filtered = await db.waste.count({ where });

    return {
        data: wastes.map(mapWaste),
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const createWasteAdjustment = async ({
    wasteDto,
    userId
}) => {

    try {

        const waste = await getDb().$transaction(async (tx) => {

            const supplierProduct = await findSupplierProductById({
                tx,
                id: wasteDto.supplierProductId
            });

            const initialStockReason = await findInitialStockAdjustmentReason({ tx });

            if (!initialStockReason) throw new WasteInitialStockReasonNotFound();

            const stockAdjustment = await createStockAdjustmentByQuantityChange({
                tx,
                productId: supplierProduct.id,
                supplierId: supplierProduct.supplier?.id,
                reasonId: initialStockReason.id,
                observations: wasteDto.observations,
                quantityChange: -Number(toNumber(wasteDto.currentStock) || 0),
                userId,
                base: wasteDto.base,
                height: wasteDto.height,
                returnAdjustment: true
            });

            const waste = await tx.waste.create({
                data: {
                    supplierProduct: { connect: { id: wasteDto.supplierProductId } },
                    stockAdjustment: { connect: { id: stockAdjustment.id } },
                    base: wasteDto.base,
                    height: wasteDto.height,
                    ...buildWasteStockData(wasteDto)
                },
                include: WASTE_INCLUDE
            });

            return mapWaste(waste);
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.createWasteAdjustment',
            ...getModelLogContext('waste', { userId, ...wasteDto, id: waste.id })
        }, 'Merma registrada correctamente');

        return waste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.createWasteAdjustment',
            ...getModelLogContext('waste', { userId, ...wasteDto })
        }, 'Error específico al registrar merma en transacción');

        handleWasteServiceError({
            err,
            fallbackError: new WasteUpdateDatabaseError()
        });
    }
};

export const updateWaste = async ({
    id,
    wasteDto
}) => {

    try {

        const waste = await getDb().$transaction(async (tx) => {

            const currentWaste = await findWasteById({ tx, id });

            await findSupplierProductById({
                tx,
                id: wasteDto.supplierProductId
            });

            const updatedWaste = await tx.waste.update({
                where: { id },
                data: {
                    supplierProduct: { connect: { id: wasteDto.supplierProductId } },
                    base: wasteDto.base,
                    height: wasteDto.height,
                    ...buildWasteStockData({
                        ...wasteDto,
                        currentStock: Number(toNumber(currentWaste.currentStock) || 0)
                    })
                },
                include: WASTE_INCLUDE
            });

            return mapWaste(updatedWaste);
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.updateWaste',
            ...getModelLogContext('waste', { id, ...wasteDto })
        }, 'Merma actualizada correctamente');

        return waste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.updateWaste',
            ...getModelLogContext('waste', { id, ...wasteDto })
        });

        handleWasteServiceError({
            err,
            fallbackError: new WasteUpdateDatabaseError()
        });
    }
};

export const updateWasteStock = async ({
    id,
    wasteStockDto,
    userId
}) => {

    try {

        const waste = await getDb().$transaction(async (tx) => {

            const currentWaste = await findWasteById({ tx, id });
            const newWasteStock = wasteStockDto.currentStock;

            const updatedWaste = await adjustWasteStock({
                tx,
                id,
                currentStock: newWasteStock,
                base: currentWaste.base,
                height: currentWaste.height
            });

            return mapWaste(updatedWaste);
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.updateWasteStock',
            ...getModelLogContext('wasteStock', { id, userId, ...wasteStockDto })
        }, 'Stock de merma ajustado correctamente');

        return waste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.updateWasteStock',
            ...getModelLogContext('wasteStock', { id, userId, ...wasteStockDto })
        });

        handleWasteServiceError({
            err,
            fallbackError: new WasteStockAdjustmentDatabaseError()
        });
    }
};
