import { toNumber } from '../../../utils/formattersUtils.js';
import { lockMaterialIdentity } from '../../../repository/warehouse/stockLockRepository.js';
import { AppError } from '../../../errors/AppError.js';
import { materialCatalogValidation } from '../../../shared/validation/validators.js';
import { normalizeDatabaseError } from '../../../errors/databaseError.js';
import {
    MaterialAlreadyExists,
    MaterialIdentityLinkedConflict,
    MaterialCreateDatabaseError,
    MaterialInitialStockReasonNotFound,
    MaterialNotFound,
    MaterialUpdateDatabaseError,
    MaterialStockAdjustmentDatabaseError,
    MaterialDeleteDatabaseError,
    MaterialDeleteRelationConflict
} from "../../../errors/warehouse/materialError.js";
import { findPage } from '../../../repository/paginationRepository.js';
import { getDb } from "../../../repository/baseRepository.js";
import {
    existsMaterialUsage,
    findAllSupplierMaterials,
    findSupplierMaterialByIds,
    createSupplierMaterial
} from "./supplierMaterialService.js";
import { assertMaterialRollReference, prepareMaterialData } from "./materialHelpers.js";
import { isAppError } from "../../../errors/AppError.js";
import { createStockAdjustment } from "../adjustmentService.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findInitialStockAdjustmentReason } from "../reasonService.js";
import { MATERIAL_TYPES, MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT } from '../../../shared/constants/inventory.js';

import { updateVersionedRecord } from '../../../repository/versionRepository.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';

const serviceLogger = createServiceLogger('warehouse.materials.materialService');

const throwMaterialWriteError = ({ err, fallbackError }) => {
    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new MaterialNotFound();
    }

    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) {
        throw new MaterialAlreadyExists();
    }

    const normalizedError = normalizeDatabaseError(err);
    if (isAppError(normalizedError)) throw normalizedError;

    throw fallbackError;
};

const buildMaterialData = ({ rest, relations }) => ({
    ...rest,
    presentation: {
        connect: { id: relations.presentationId }
    },
    unitMeasure: {
        connect: { id: relations.unitMeasureId }
    }
});

const findMaterialByIdentity = ({ tx, rest, relations }) => tx.material.findFirst({
    where: {
        name: { equals: rest.name, mode: 'insensitive' },
        presentationId: relations.presentationId,
        unitMeasureId: relations.unitMeasureId,
        base: rest.base ?? null,
        height: rest.height ?? null,
        type: rest.type ?? MATERIAL_TYPES.MATERIAL
    },
    select: { id: true }
});

export const findAllMaterials = async ({
    skip = 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc',
    canReadCosts = false
}) => {

    return await findAllSupplierMaterials({
        skip,
        take,
        search,
        supplierId,
        type: MATERIAL_TYPES.MATERIAL,
        orderBy,
        orderDir,
        canReadCosts
    });
};

const DEFAULT_MATERIAL_SNAPSHOT_SELECT = {
    id: true,
    type: true,
    name: true,
    minStock: true,
    presentation: { select: { name: true } },
    base: true,
    height: true
};

export const MATERIAL_CATALOG_SELECT = Object.freeze({
    ...DEFAULT_MATERIAL_SNAPSHOT_SELECT,
    version: true,
    presentationId: true,
    _count: { select: { supplierMaterials: true } },
    unitMeasureId: true,
    unitMeasure: { select: { name: true, symbol: true } }
});

export const findMaterialCatalogEntries = ({ skip = 0, take = 10, search = '', type = null, includeSupplierCount = true } = {}) => findPage({
    model: getDb().material,
    totalWhere: type ? { type } : {},
    hasFilters: Boolean(search),
    query: {
        skip, take,
        where: { ...(type && { type }), ...(search && { name: { contains: search, mode: 'insensitive' } }) },
        select: { ...MATERIAL_CATALOG_SELECT, ...(!includeSupplierCount && { _count: false }) },
        orderBy: [{ name: 'asc' }, { id: 'asc' }]
    }
});

export const createMaterialCatalogEntry = async data => {
    try {
        return await getDb().$transaction(async tx => {
            const { rest, relations } = await prepareMaterialData({ tx, materialDto: data, requireSupplier: false });
            if (await findMaterialByIdentity({ tx, rest, relations })) throw new MaterialAlreadyExists();
            return tx.material.create({ data: buildMaterialData({ rest, relations }), select: MATERIAL_CATALOG_SELECT });
        });
    } catch (err) { throwMaterialWriteError({ err, fallbackError: new MaterialCreateDatabaseError() }); }
};

export const updateMaterialCatalogEntry = async (id, input) => {
    try {
        return await getDb().$transaction(async tx => {
            // Serializa la edición con los INSERT de relaciones que comprueban esta FK.
            await lockMaterialIdentity({ tx, id, forEditing: true });
            const current = await tx.material.findUnique({ where: { id }, select: { ...MATERIAL_CATALOG_SELECT, unitMeasure: false } });
            if (!current) throw new MaterialNotFound();
            const identityChanged = ['type', 'presentationId', 'unitMeasureId', 'base', 'height'].some(field =>
                input[field] !== undefined && String(input[field] ?? '') !== String(current[field] ?? ''));
            let data = { name: input.name, ...(input.minStock !== undefined && { minStock: input.minStock }) };
            if (identityChanged && current._count.supplierMaterials === 0) {
                const capture = { ...current, base: toNumber(current.base),
                    height: toNumber(current.height), minStock: Number(current.minStock), ...input };
                if (Object.entries(materialCatalogValidation).some(([field, rule]) => rule(capture[field], capture))) {
                    throw new AppError('Revise los datos del material.', 'CATALOG_VALIDATION_ERROR', 400);
                }
                const { rest, relations } = await prepareMaterialData({ tx, requireSupplier: false,
                    materialDto: Object.fromEntries(Object.keys(materialCatalogValidation).map(field => [field, capture[field]])) });
                data = buildMaterialData({ rest, relations });
            } else {
                if (identityChanged) {
                    throw new MaterialIdentityLinkedConflict();
                }
                assertPieceQuantity({ quantity: input.minStock, item: current });
            }
            return updateVersionedRecord({ model: tx.material, where: { id }, expectedVersion: input.expectedVersion,
                data, select: MATERIAL_CATALOG_SELECT });
        });
    } catch (err) { throwMaterialWriteError({ err, fallbackError: new MaterialUpdateDatabaseError() }); }
};

export const findMaterialCatalog = async ({ skip = 0, take = 10, search = '', type = MATERIAL_TYPES.MATERIAL }) => {
    const page = await findMaterialCatalogEntries({ skip, take, search, type, includeSupplierCount: false });
    return { ...page, data: page.data.map(material => ({ material })) };
};

export const findMaterialsSnapshot = async ({
    tx = null,
    materialIds,
    supplierId = null
}) => {

    const db = getDb(tx);

    const materials = await db.material.findMany({
        where: {
            id: {
                in: materialIds
            }
        },
        select: {
            ...DEFAULT_MATERIAL_SNAPSHOT_SELECT,
            ...(supplierId && {
                supplierMaterials: {
                    where: { supplierId },
                    select: { isActive: true }
                }
            })
        }
    });

    if (!supplierId) return materials;

    return materials.map(({ supplierMaterials, ...material }) => ({
        ...material,
        isActive: supplierMaterials[0]?.isActive ?? true
    }));
}

export const existsMaterial = async ({
    tx,
    id,
    type = null
}) => {

    const db = getDb(tx);

    const materialExists = await db.material.findUnique({
        where: { id, ...(type && { type }) },
        select: { id: true }
    });

    if (!materialExists) throw new MaterialNotFound();

    return materialExists;
}

export const createMaterial = async ({
    materialDto,
    userId = null,
    type = MATERIAL_TYPES.MATERIAL
}) => {

    try {

        const material = await getDb().$transaction(async (tx) => {
            const { newStock, observations, creationContext, materialId: selectedId, ...materialData } = materialDto;
            let materialContext = null;
            if (selectedId) {
                await lockMaterialIdentity({ tx, id: selectedId });
                const selected = await tx.material.findUnique({ where: { id: selectedId, type }, select: { ...DEFAULT_MATERIAL_SNAPSHOT_SELECT, presentationId: true, unitMeasureId: true,
                    presentation: { select: { id: true, name: true, isActive: true } } } });
                if (!selected) throw new MaterialNotFound();
                if (selected.presentation.isActive) {
                    materialContext = { presentations: new Map([[selected.presentationId, selected.presentation]]) };
                }
                // La identidad proviene del catálogo, nunca de campos adicionales del cliente.
                Object.assign(materialData, { name: selected.name, presentationId: selected.presentationId,
                    unitMeasureId: selected.unitMeasureId, base: toNumber(selected.base), height: toNumber(selected.height), minStock: Number(selected.minStock) });
            }
            const catalogOnly = creationContext === MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT;
            const { rest, relations } = await prepareMaterialData({
                tx,
                materialDto: { ...materialData, type },
                context: materialContext
            });

            const existingMaterial = selectedId ? { id: selectedId } : await findMaterialByIdentity({ tx, rest, relations });
            let materialId = existingMaterial?.id;

            if (existingMaterial && !catalogOnly) {
                const existingSupplierMaterial = await tx.supplierMaterial.findUnique({
                    where: {
                        supplierId_materialId: {
                            supplierId: relations.supplierId,
                            materialId
                        }
                    },
                    select: { id: true }
                });

                if (existingSupplierMaterial) throw new MaterialAlreadyExists();
            } else if (!existingMaterial) {
                const createdMaterial = await tx.material.create({
                    data: buildMaterialData({ rest, relations }),
                    select: { id: true }
                });

                materialId = createdMaterial.id;
            }

            if (catalogOnly) {
                return { material: await tx.material.findUniqueOrThrow({
                    where: { id: materialId },
                    select: { ...DEFAULT_MATERIAL_SNAPSHOT_SELECT, version: true, unitMeasure: true }
                }) };
            }

            await createSupplierMaterial({
                tx,
                supplierId: relations.supplierId,
                materialId,
                maxUnitCost: relations.maxUnitCost,
                isActive: relations.isActive
            });

            if (newStock !== undefined) {
                const initialStockReason = await findInitialStockAdjustmentReason({ tx });

                if (!initialStockReason) throw new MaterialInitialStockReasonNotFound();

                await createStockAdjustment({
                    tx,
                    materialId,
                    supplierId: relations.supplierId,
                    reasonId: initialStockReason.id,
                    observations,
                    newStock,
                    userId
                });
            }

            return findSupplierMaterialByIds({
                tx,
                materialId,
                supplierId: relations.supplierId
            });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.materials.materialService.createMaterial',
            ...getModelLogContext('material', { ...materialDto, id: material?.materialId ?? material?.id ?? material?.material?.id })
        }, 'Material creado correctamente');

        return material;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.createMaterial',
            ...getModelLogContext('material', materialDto)
        });

        throwMaterialWriteError({
            err,
            fallbackError: new MaterialCreateDatabaseError()
        });
    };
};

export const updateMaterial = async (materialDto, id, { type = null } = {}) => {

    try {

        const material = await getDb().$transaction(async (tx) => {

            const { supplierId, maxUnitCost, isActive, referenceConeWeightKg, referenceRollTotalWeightKg, expectedVersion, expectedMaterialVersion, ...materialData } = materialDto;

            const currentMaterial = await tx.material.findUnique({
                where: { id, ...(type && { type }) },
                select: {
                    id: true,
                    presentationId: true,
                    presentation: { select: { name: true } },
                    unitMeasureId: true,
                    base: true,
                    height: true,
                    type: true
                }
            });

            if (!currentMaterial) throw new MaterialNotFound();
            assertPieceQuantity({ quantity: materialData.minStock, item: currentMaterial });
            assertMaterialRollReference({ referenceConeWeightKg, referenceRollTotalWeightKg });

            const existingMaterial = await tx.material.findFirst({
                where: {
                    name: { equals: materialDto.name, mode: 'insensitive' },
                    presentationId: currentMaterial.presentationId,
                    unitMeasureId: currentMaterial.unitMeasureId,
                    base: currentMaterial.base ?? null,
                    height: currentMaterial.height ?? null,
                    type: currentMaterial.type,
                    NOT: { id }
                },
                select: { id: true }
            });

            if (existingMaterial) {
                throw new MaterialAlreadyExists();
            }

            const updatedMaterial = await updateVersionedRecord({
                model: tx.material, expectedVersion: expectedMaterialVersion,
                where: { id },
                data: materialData
            });

            await updateVersionedRecord({
                model: tx.supplierMaterial, expectedVersion,
                where: { supplierId_materialId: { materialId: updatedMaterial.id, supplierId } },
                data: { maxUnitCost, isActive }
            });

            return findSupplierMaterialByIds({
                tx,
                materialId: updatedMaterial.id,
                supplierId
            });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.materials.materialService.updateMaterial',
            ...getModelLogContext('material', { id, ...materialDto })
        }, 'Material actualizado correctamente');

        return material;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.updateMaterial',
            ...getModelLogContext('material', { id, ...materialDto })
        });

        throwMaterialWriteError({
            err,
            fallbackError: new MaterialUpdateDatabaseError()
        });
    };
};

export const updateMaterialStock = async ({
    materialDto,
    userId,
    id,
    type = null
}) => {

    try {

        if (type) await existsMaterial({ id, type });

        const stockAdjustment = await createStockAdjustment({
            materialId: id,
            supplierId: materialDto.supplierId,
            reasonId: materialDto.reasonId,
            observations: materialDto.observations,
            newStock: materialDto.newStock,
            expectedVersion: materialDto.expectedVersion,
            userId
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.materials.materialService.updateMaterialStock',
            ...getModelLogContext('materialStock', { id, userId, ...materialDto })
        }, 'Stock de material ajustado correctamente');

        return stockAdjustment;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.updateMaterialStock',
            ...getModelLogContext('materialStock', { id, userId, ...materialDto })
        });

        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
            throw new MaterialNotFound();
        }

        const normalizedError = normalizeDatabaseError(err);
        if (isAppError(normalizedError)) throw normalizedError;

        throw new MaterialStockAdjustmentDatabaseError();
    }
};

export const deleteMaterial = async (supplierMaterialId, { type = null } = {}) => {

    try {

        const deletedMaterial = await getDb().$transaction(async (tx) => {

            const supplierMaterial = await tx.supplierMaterial.findUnique({
                where: { id: supplierMaterialId },
                select: { materialId: true, material: { select: { type: true } } }
            });

            if (!supplierMaterial) throw new MaterialNotFound();
            if (type && supplierMaterial.material.type !== type) throw new MaterialNotFound();

            const { materialId } = supplierMaterial;

            if (await existsMaterialUsage({ tx, materialId })) {
                throw new MaterialDeleteRelationConflict();
            }

            await tx.supplierMaterial.delete({ where: { id: supplierMaterialId } });

            const remainingRelations = await tx.supplierMaterial.count({ where: { materialId } });

            if (remainingRelations > 0) return { id: materialId };

            return tx.material.delete({ where: { id: materialId }, select: { id: true } });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.materials.materialService.deleteMaterial',
            ...getModelLogContext('supplierMaterial', { id: supplierMaterialId })
        }, 'Relación entre material y proveedor eliminada correctamente');

        return deletedMaterial;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.deleteMaterial',
            ...getModelLogContext('supplierMaterial', { id: supplierMaterialId })
        });

        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) throw new MaterialNotFound();
        if (err.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) throw new MaterialDeleteRelationConflict();
        const normalizedError = normalizeDatabaseError(err);
        if (isAppError(normalizedError)) throw normalizedError;

        throw new MaterialDeleteDatabaseError();
    }
};
