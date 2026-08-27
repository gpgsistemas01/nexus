import { isAppError } from '../../../errors/AppError.js';
import { WasteAlreadyExists, WasteInitialStockReasonNotFound, WasteNotFound, WasteStockAdjustmentDatabaseError, WasteUpdateDatabaseError } from '../../../errors/warehouse/wasteError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { findInitialStockAdjustmentReason } from '../reasonService.js';
import { registerWasteStockAdjustment } from './wasteStockAdjustmentService.js';
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { resolveWasteMaterialSnapshot } from './wasteMaterialService.js';

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
    supplier: { select: { id: true, tradeName: true } },
    presentation: { select: { id: true, name: true } },
    unitMeasure: { select: { id: true, name: true, symbol: true } }
};

const findWasteByIdentity = async ({ tx, supplierId, name, base, height, excludeId = null }) => {
    const db = getDb(tx);

    const where = excludeId
        ? {
            supplierId,
            name,
            base,
            height,
            NOT: { id: excludeId }
        }
        : {
            supplierId,
            name,
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
    orderDir = 'asc',
    canReadCosts = false
}) => {

    const where = { AND: [] };

    if (search) where.AND.push({
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            {
                supplier: {
                    tradeName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            }
        ]
    });

    if (supplierId) where.AND.push({
        supplierId
    });

    if (where.AND.length === 0) delete where.AND;

    const orderMap = {
        name: { name: orderDir },
        supplier: { supplier: { tradeName: orderDir } }
    };

    const db = getDb();

    const [wastes, total, filtered] = await Promise.all([
        db.waste.findMany({
            skip,
            take,
            where,
            select: {
                id: true,
                supplierId: true,
                name: true,
                base: true,
                height: true,
                ...(canReadCosts && { maxUnitCost: true }),
                minStock: true,
                isActive: true,
                currentStock: true,
                convertedQuantity: true,
                createdAt: true,
                updatedAt: true,
                supplier: WASTE_INCLUDE.supplier,
                presentation: WASTE_INCLUDE.presentation,
                unitMeasure: WASTE_INCLUDE.unitMeasure
            },
            orderBy: orderMap[orderBy] || orderMap.name
        }),
        db.waste.count(),
        db.waste.count({ where })
    ]);

    return {
        data: wastes,
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

            const material = await resolveWasteMaterialSnapshot({
                tx,
                materialId: wasteDto.materialId
            });

            if (!material) throw new WasteNotFound();

            const existingWaste = await findWasteByIdentity({
                tx,
                supplierId: wasteDto.supplierId,
                name: material.name,
                base: wasteDto.base,
                height: wasteDto.height
            });

            if (existingWaste) throw new WasteAlreadyExists();

            const initialStockReason = await findInitialStockAdjustmentReason({ tx });

            if (!initialStockReason) throw new WasteInitialStockReasonNotFound();

            const waste = await tx.waste.create({
                data: {
                    name: material.name,
                    supplier: { connect: { id: wasteDto.supplierId } },
                    presentation: { connect: { id: material.presentation.id } },
                    unitMeasure: { connect: { id: material.unitMeasure.id } },
                    maxUnitCost: wasteDto.maxUnitCost,
                    base: wasteDto.base,
                    height: wasteDto.height,
                    currentStock: wasteDto.newStock,
                    convertedQuantity: calculateConvertedQuantity({
                        currentStock: wasteDto.newStock,
                        base: wasteDto.base,
                        height: wasteDto.height
                    })
                }
            });

            await registerWasteStockAdjustment({
                tx,
                waste,
                reasonId: initialStockReason.id,
                userId,
                observations: wasteDto.observations,
                newStock: toNumber(waste.currentStock) || 0,
                previousStock: 0,
                previousConvertedQuantity: 0,
                updateStock: false
            });

            return waste;
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

            await findWasteById({ tx, id });

            return await tx.waste.update({
                where: { id },
                data: wasteDto
            });
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

            await registerWasteStockAdjustment({
                tx,
                waste: currentWaste,
                reasonId: wasteStockDto.reasonId,
                userId,
                observations: wasteStockDto.observations,
                newStock: wasteStockDto.newStock,
                include: WASTE_INCLUDE
            });
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
