import { normalizeDatabaseError } from '../../../errors/databaseError.js';
import { findPage } from '../../../repository/paginationRepository.js';
import { isAppError } from '../../../errors/AppError.js';
import {
    WasteAlreadyExists,
    WasteMaterialInvalid,
    WasteNotFound,
    WasteStockAdjustmentDatabaseError,
    WasteStockEntryDatabaseError,
    WasteUpdateDatabaseError,
    WasteWeightReadOnly
} from '../../../errors/warehouse/wasteError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { registerWasteStockAdjustment } from './wasteStockAdjustmentService.js';
import { registerWasteStockEntry } from './wasteStockEntryService.js';
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findSupplierMaterialByIds } from '../materials/supplierMaterialService.js';
import { SupplierInactiveConflict } from '../../../errors/warehouse/supplierError.js';
import { prepareWasteMeasurements } from './wasteHelpers.js';
import { lockWasteStock } from '../../../repository/warehouse/stockLockRepository.js';
import { MATERIAL_TYPES } from '../../../constants/inventory.js';
import { WASTE_IMMUTABLE_FIELDS, WASTE_OPERATION_ACTIONS } from '../../../public/js/constants/inventory.js';
import { isSquareMeterUnitMeasure } from '../../../public/js/utils/warehouseInventoryUtils.js';

import { assertRecordVersion, updateVersionedRecord } from '../../../repository/versionRepository.js';
import { executeWasteOperation, markWasteOperationRejected } from './wasteOperationService.js';

const serviceLogger = createServiceLogger('warehouse.wasteService');

const handleWasteServiceError = ({ err, fallbackError, operationId }) => {
    const normalizedError = normalizeDatabaseError(err);
    let error = isAppError(normalizedError) ? normalizedError : fallbackError;
    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) error = new WasteNotFound();
    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) error = new WasteAlreadyExists();
    throw markWasteOperationRejected({ err: error, operationId });
};

const WASTE_INCLUDE = {
    supplier: { select: { id: true, tradeName: true } },
    presentation: { select: { id: true, name: true } },
    unitMeasure: { select: { id: true, name: true, symbol: true } }
};

const findWasteByIdentity = async ({ tx, supplierId, name, base, height, coneWeightKg = null, totalWeightKg = null, excludeId = null }) => {
    const db = getDb(tx);

    const where = excludeId
        ? {
            supplierId,
            name,
            base,
            height, coneWeightKg, totalWeightKg,
            NOT: { id: excludeId }
        }
        : {
            supplierId,
            name,
            base,
            height, coneWeightKg, totalWeightKg
        };

    return db.waste.findFirst({
        where,
        select: { id: true, name: true, supplierId: true, base: true, height: true, coneWeightKg: true, totalWeightKg: true, weightKg: true, currentStock: true, presentation: true, unitMeasure: true, supplier: { select: { tradeName: true } } }
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

    return findPage({
        model: db.waste,
        hasFilters: Boolean(search || supplierId),
        query: {
            skip,
            take,
            where,
            select: {
                id: true,
                version: true,
                supplierId: true,
                name: true,
                base: true,
                height: true,
                weightKg: true,
                coneWeightKg: true,
                totalWeightKg: true,
                sampleLengthM: true,
                sampleNetWeightKg: true,
                referenceRollTotalWeightKg: true,
                sourceMaterialId: true,
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
        }
    });
};

export const createWaste = async ({
    wasteDto,
    userId,
    operationId
}) => {

    let identity;
    try {

        const waste = await executeWasteOperation({
            operationId, userId, command: { action: WASTE_OPERATION_ACTIONS.CREATE, ...wasteDto },
            execute: async tx => {
                const offer = await findSupplierMaterialByIds({
                    tx,
                    materialId: wasteDto.materialId,
                    supplierId: wasteDto.supplierId
                });

                if (offer.supplier?.isActive === false) throw new SupplierInactiveConflict();
                if (!offer.isActive) throw new WasteNotFound();

                const material = offer.material;
                // El origen de una merma es un material de superficie, no un consumible.
                if (material.type !== MATERIAL_TYPES.MATERIAL || !isSquareMeterUnitMeasure(material.unitMeasure)) {
                    throw new WasteMaterialInvalid();
                }
                const coneWeightKg = wasteDto.coneWeightKg;
                const { base, height, weightKg } = prepareWasteMeasurements({ wasteDto, offer });
                identity = { supplierId: wasteDto.supplierId, name: wasteDto.name, base, height, coneWeightKg: coneWeightKg ?? null, totalWeightKg: wasteDto.totalWeightKg ?? null };
                const existingWaste = await findWasteByIdentity({ tx, ...identity });
                if (existingWaste) throw new WasteAlreadyExists({ waste: existingWaste });

                const waste = await tx.waste.create({
                    data: {
                        name: wasteDto.name,
                        supplier: { connect: { id: wasteDto.supplierId } },
                        presentation: { connect: { id: material.presentation.id } },
                        unitMeasure: { connect: { id: material.unitMeasure.id } },
                        maxUnitCost: wasteDto.maxUnitCost,
                        minStock: wasteDto.minStock,
                        isActive: wasteDto.isActive,
                        base,
                        height,
                        sourceMaterial: { connect: { id: material.id } },
                        coneWeightKg: coneWeightKg ?? null,
                        totalWeightKg: wasteDto.totalWeightKg ?? null,
                        referenceRollTotalWeightKg: wasteDto.referenceRollTotalWeightKg ?? null,
                        weightKg,
                        currentStock: 0,
                        convertedQuantity: 0
                    }
                });

                // Sin existencia no hay entrada ni folio; la cantidad positiva se aplica una sola vez.
                if (wasteDto.initialQuantity === 0) return waste;

                await registerWasteStockEntry({
                    tx,
                    waste,
                    userId,
                    observations: wasteDto.observations,
                    quantity: wasteDto.initialQuantity
                });

                return findWasteById({ tx, id: waste.id });
            }
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.createWaste',
            ...getModelLogContext('waste', { userId, ...wasteDto, id: waste.id })
        }, 'Merma registrada correctamente');

        return waste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.createWaste',
            ...getModelLogContext('waste', { userId, ...wasteDto })
        }, 'Error específico al registrar merma en transacción');

        // Después del rollback se puede consultar al ganador de una identidad única.
        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE && identity) {
            const existingWaste = await findWasteByIdentity(identity);
            if (existingWaste) throw markWasteOperationRejected({ err: new WasteAlreadyExists({ waste: existingWaste }), operationId });
        }

        handleWasteServiceError({
            err, operationId,
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

            if (WASTE_IMMUTABLE_FIELDS.some(field => Object.prototype.hasOwnProperty.call(wasteDto, field))) throw new WasteWeightReadOnly();

            if (wasteDto.name && wasteDto.name !== currentWaste.name) {
                const existingWaste = await findWasteByIdentity({
                    tx,
                    supplierId: currentWaste.supplierId,
                    name: wasteDto.name,
                    base: currentWaste.base,
                    height: currentWaste.height, coneWeightKg: currentWaste.coneWeightKg ?? null, totalWeightKg: currentWaste.totalWeightKg ?? null,
                    excludeId: id
                });

                if (existingWaste) throw new WasteAlreadyExists();
            }

            const { expectedVersion, ...data } = wasteDto;
            return updateVersionedRecord({ model: tx.waste, where: { id }, expectedVersion, data });
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
    stockAdjustmentDto,
    userId
}) => {

    try {

        const waste = await getDb().$transaction(async (tx) => {

            await lockWasteStock({ tx, id });
            const currentWaste = await findWasteById({ tx, id });
            assertRecordVersion(currentWaste, stockAdjustmentDto.expectedVersion);

            return registerWasteStockAdjustment({
                tx,
                waste: currentWaste,
                reasonId: stockAdjustmentDto.reasonId,
                userId,
                observations: stockAdjustmentDto.observations,
                newStock: stockAdjustmentDto.newStock,
                include: WASTE_INCLUDE
            });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.updateWasteStock',
            ...getModelLogContext('wasteStock', { id, userId, ...stockAdjustmentDto })
        }, 'Stock de merma ajustado correctamente');

        return waste;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.updateWasteStock',
            ...getModelLogContext('wasteStock', { id, userId, ...stockAdjustmentDto })
        });

        handleWasteServiceError({
            err,
            fallbackError: new WasteStockAdjustmentDatabaseError()
        });
    }
};

export const addWasteStock = async ({ id, stockEntryDto, userId, operationId }) => {
    try {
        const waste = await executeWasteOperation({
            operationId, userId, command: { action: WASTE_OPERATION_ACTIONS.ADD_STOCK, id, ...stockEntryDto },
            execute: async tx => {
                const currentWaste = await findWasteById({ tx, id });
                await registerWasteStockEntry({
                    tx,
                    waste: currentWaste,
                    quantity: stockEntryDto.quantity,
                    observations: stockEntryDto.observations,
                    userId
                });
                return findWasteById({ tx, id });
            }
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.wasteService.addWasteStock',
            ...getModelLogContext('wasteStockEntry', { id, userId, ...stockEntryDto })
        }, 'Stock de merma agregado correctamente');

        return waste;
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.wasteService.addWasteStock',
            ...getModelLogContext('wasteStockEntry', { id, userId, ...stockEntryDto })
        });
        handleWasteServiceError({ err, operationId, fallbackError: new WasteStockEntryDatabaseError() });
    }
};
