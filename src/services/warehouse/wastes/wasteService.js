import { isAppError } from '../../../errors/AppError.js';
import { WasteAlreadyExists, WasteDeleteDatabaseError, WasteInitialStockReasonNotFound, WasteNotFound, WasteStockAdjustmentDatabaseError, WasteUpdateDatabaseError } from '../../../errors/warehouse/wasteError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { findSupplierMaterialById } from '../materials/supplierMaterialService.js';
import { findInitialStockAdjustmentReason } from '../reasonService.js';
import { registerWasteStockAdjustment } from './wasteStockAdjustmentService.js';
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";

const serviceLogger = createServiceLogger('warehouse.wasteService');



const handleWasteServiceError = ({ err, fallbackError }) => {

    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new WasteNotFound();
    }

    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) {
        throw new WasteAlreadyExists();
    }

    if (isAppError(err)) throw err;

    throw fallbackError;
};

const WASTE_INCLUDE = {
    supplierMaterial: {
        select: {
            id: true,
            materialId: true,
            supplierId: true,
            maxUnitCost: true,
            currentStock: true,
            convertedQuantity: true,
            material: {
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

    const { supplierMaterial } = waste;
    const { material, supplier } = supplierMaterial || {};

    return {
        id: waste.id,
        supplierMaterialId: waste.supplierMaterialId,
        supplierMaterial: supplierMaterial ? { ...supplierMaterial } : null,
        materialId: material?.id,
        materialName: material?.name,
        name: material?.name,
        isActive: waste.isActive,
        base: waste.base,
        height: waste.height,
        minStock: waste.minStock,
        currentStock: waste.currentStock,
        convertedQuantity: waste.convertedQuantity,
        maxUnitCost: supplierMaterial?.maxUnitCost ?? null,
        presentation: material?.presentation ?? null,
        unitMeasure: material?.unitMeasure ?? null,
        material,
        supplier
    };
};

const findWasteBySupplierMaterialAndDimensions = async ({ tx, supplierMaterialId, base, height, excludeId = null }) => {
    const db = getDb(tx);

    const where = excludeId
        ? {
            supplierMaterialId,
            base,
            height,
            NOT: { id: excludeId }
        }
        : {
            supplierMaterialId,
            base,
            height
        };

    return db.waste.findFirst({
        where,
        select: { id: true }
    });
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
                supplierMaterial: {
                    material: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            },
            {
                supplierMaterial: {
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
        supplierMaterial: {
            supplierId
        }
    });

    if (where.AND.length === 0) delete where.AND;

    const orderMap = {
        name: { supplierMaterial: { material: { name: orderDir } } },
        supplier: { supplierMaterial: { supplier: { tradeName: orderDir } } }
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

export const createWasteWithInitialStockAdjustment = async ({
    wasteDto,
    userId
}) => {

    try {

        const waste = await getDb().$transaction(async (tx) => {

            await findSupplierMaterialById({
                tx,
                id: wasteDto.supplierMaterialId
            });

            const existingWaste = await findWasteBySupplierMaterialAndDimensions({
                tx,
                supplierMaterialId: wasteDto.supplierMaterialId,
                base: wasteDto.base,
                height: wasteDto.height
            });

            if (existingWaste) {
                throw new WasteAlreadyExists();
            }

            const initialStockReason = await findInitialStockAdjustmentReason({ tx });
            if (!initialStockReason) throw new WasteInitialStockReasonNotFound();

            const waste = await tx.waste.create({
                data: {
                    supplierMaterial: { connect: { id: wasteDto.supplierMaterialId } },
                    base: wasteDto.base,
                    height: wasteDto.height,
                    currentStock: wasteDto.currentStock,
                    convertedQuantity: calculateConvertedQuantity({
                        currentStock: wasteDto.currentStock,
                        base: wasteDto.base,
                        height: wasteDto.height
                    })
                },
                include: WASTE_INCLUDE
            });

            await registerWasteStockAdjustment({
                tx,
                waste,
                reasonId: initialStockReason.id,
                userId,
                observations: wasteDto.observations,
                newStock: Number(toNumber(waste.currentStock) || 0),
                previousStock: 0,
                previousConvertedQuantity: 0,
                updateStock: false
            });

            return mapWaste(waste);
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.createWasteWithInitialStockAdjustment',
            ...getModelLogContext('waste', { userId, ...wasteDto, id: waste.id })
        }, 'Merma registrada correctamente');

        return waste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.createWasteWithInitialStockAdjustment',
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

            await findSupplierMaterialById({
                tx,
                id: wasteDto.supplierMaterialId
            });

            const existingWaste = await findWasteBySupplierMaterialAndDimensions({
                tx,
                supplierMaterialId: wasteDto.supplierMaterialId,
                base: wasteDto.base,
                height: wasteDto.height,
                excludeId: id
            });

            if (existingWaste) {
                throw new WasteAlreadyExists();
            }

            const updatedWaste = await tx.waste.update({
                where: { id },
                data: {
                    supplierMaterial: { connect: { id: wasteDto.supplierMaterialId } },
                    base: wasteDto.base,
                    height: wasteDto.height,
                    convertedQuantity: calculateConvertedQuantity({
                        currentStock: currentWaste.currentStock,
                        base: wasteDto.base,
                        height: wasteDto.height
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


export const deleteWaste = async (id) => {

    try {

        const deletedWaste = await getDb().$transaction(async (tx) => {

            await findWasteById({ tx, id });

            const stockAdjustmentDetails = await tx.wasteStockAdjustmentDetail.findMany({
                where: { wasteId: id },
                select: { wasteStockAdjustmentId: true }
            });
            const stockAdjustmentIds = stockAdjustmentDetails.map(({ wasteStockAdjustmentId }) => wasteStockAdjustmentId);

            await tx.wasteMovementDetail.deleteMany({ where: { wasteId: id } });

            if (stockAdjustmentIds.length) {
                const stockAdjustments = await tx.wasteStockAdjustment.findMany({
                    where: { id: { in: stockAdjustmentIds } },
                    select: { wasteMovementId: true }
                });
                const wasteMovementIds = stockAdjustments
                    .map(({ wasteMovementId }) => wasteMovementId)
                    .filter(Boolean);

                if (wasteMovementIds.length) {
                    await tx.wasteMovement.deleteMany({
                        where: { id: { in: wasteMovementIds } }
                    });
                }

                await tx.wasteStockAdjustment.deleteMany({
                    where: { id: { in: stockAdjustmentIds } }
                });
            }

            return tx.waste.delete({
                where: { id },
                select: { id: true }
            });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.deleteWaste',
            ...getModelLogContext('waste', { id })
        }, 'Merma eliminada correctamente');

        return deletedWaste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.deleteWaste',
            ...getModelLogContext('waste', { id })
        });

        handleWasteServiceError({
            err,
            fallbackError: new WasteDeleteDatabaseError()
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

            const updatedWaste = await registerWasteStockAdjustment({
                tx,
                waste: currentWaste,
                reasonId: wasteStockDto.reasonId,
                userId,
                observations: wasteStockDto.observations,
                newStock: wasteStockDto.currentStock,
                include: WASTE_INCLUDE
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
