import { toNumber } from '../../../utils/formattersUtils.js';
import { lockMaterialIdentity, lockSupplierMaterialForRemoval } from '../../../repository/warehouse/stockLockRepository.js';
import { resolveServiceError } from '../../serviceErrorHandler.js';
import {
    MaterialAlreadyExists,
    MaterialCreateDatabaseError,
    MaterialInitialStockReasonNotFound,
    MaterialNotFound,
    MaterialUpdateDatabaseError,
    MaterialStockAdjustmentDatabaseError,
    MaterialDeleteDatabaseError,
    MaterialDeleteRelationConflict,
    MaterialDeleteStockConflict,
    MaterialDeleteHistoryConflict,
    MaterialFieldsManagedInCatalog
} from "../../../errors/warehouse/materialError.js";
import { getDb } from "../../../repository/baseRepository.js";
import {
    existsDeletableSupplierMaterial,
    findAllSupplierMaterials,
    findSupplierMaterialByIds,
    createSupplierMaterial,
    SUPPLIER_MATERIAL_DETAIL_SELECT
} from "./supplierMaterialService.js";
import {
    assertMaterialRollReference,
    buildMaterialData,
    DEFAULT_MATERIAL_SNAPSHOT_SELECT,
    findMaterialByIdentity,
    prepareMaterialData,
    throwMaterialWriteError
} from './materialHelpers.js';
import { createStockAdjustment } from "../adjustmentService.js";
import { createServiceLogger, getModelLogContext, logServiceError } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findInitialStockAdjustmentReason } from "../reasonService.js";
import { MATERIAL_TYPES, MATERIAL_CREATION_CONTEXT_GOODS_RECEIPT } from '../../../shared/constants/inventory.js';

import { assertRecordVersion, updateVersionedRecord } from '../../../repository/versionRepository.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';

const serviceLogger = createServiceLogger('warehouse.materials.materialService');

export const findAllMaterials = async ({
    skip = 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc',
    canReadCosts = false,
    canRemoveOffers = false
}) => {

    return await findAllSupplierMaterials({
        skip,
        take,
        search,
        supplierId,
        type: MATERIAL_TYPES.MATERIAL,
        orderBy,
        orderDir,
        canReadCosts,
        canRemoveOffers
    });
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
                    unitMeasureId: selected.unitMeasureId, base: toNumber(selected.base), height: toNumber(selected.height) });
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
                minStock: relations.minStock,
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

            const { supplierId, minStock, maxUnitCost, isActive, referenceConeWeightKg, referenceRollTotalWeightKg, expectedVersion, expectedMaterialVersion, name } = materialDto;

            assertMaterialRollReference({ referenceConeWeightKg, referenceRollTotalWeightKg });

            const where = {
                supplierId_materialId: { materialId: id, supplierId },
                ...(type && { material: { type } })
            };

            // Las capturas que ya enviaban datos del artículo aún validan su versión y sus valores.
            if (expectedMaterialVersion !== undefined || name !== undefined || minStock !== undefined) {
                const currentOffer = await tx.supplierMaterial.findUnique({
                    where,
                    select: { version: true, material: { select: { version: true, name: true,
                        presentation: { select: { name: true } } } } }
                });
                if (!currentOffer) throw new MaterialNotFound();
                assertRecordVersion(currentOffer, expectedVersion);

                const { material: currentMaterial } = currentOffer;
                if (expectedMaterialVersion !== undefined || name !== undefined)
                    assertRecordVersion(currentMaterial, expectedMaterialVersion);
                if (name !== undefined && name !== currentMaterial.name)
                    throw new MaterialFieldsManagedInCatalog();
                assertPieceQuantity({ quantity: minStock, item: currentMaterial });
            }

            return updateVersionedRecord({
                model: tx.supplierMaterial,
                expectedVersion,
                where,
                data: { minStock, maxUnitCost, isActive },
                select: SUPPLIER_MATERIAL_DETAIL_SELECT
            });
        });

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

        return stockAdjustment;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.updateMaterialStock',
            ...getModelLogContext('materialStock', { id, userId, ...materialDto })
        });

        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
            throw new MaterialNotFound();
        }

        throw resolveServiceError(err, new MaterialStockAdjustmentDatabaseError());
    }
};

export const deleteMaterial = async (supplierMaterialId, { type = null } = {}) => {

    try {

        const deletedMaterial = await getDb().$transaction(async (tx) => {

            const locked = await lockSupplierMaterialForRemoval({ tx, id: supplierMaterialId });
            if (locked.length === 0) throw new MaterialNotFound();

            const supplierMaterial = await tx.supplierMaterial.findUnique({
                where: { id: supplierMaterialId },
                select: { materialId: true, supplierId: true, currentStock: true, material: { select: { type: true } } }
            });

            if (!supplierMaterial) throw new MaterialNotFound();
            if (type && supplierMaterial.material.type !== type) throw new MaterialNotFound();

            const { materialId } = supplierMaterial;

            if (Number(supplierMaterial.currentStock) !== 0) throw new MaterialDeleteStockConflict();

            if (!await existsDeletableSupplierMaterial({ tx, id: supplierMaterialId, supplierId: supplierMaterial.supplierId })) {
                throw new MaterialDeleteHistoryConflict();
            }

            await tx.supplierMaterial.delete({ where: { id: supplierMaterialId } });

            // Las transacciones conservan sus propias referencias a Material y Supplier; retirar
            // esta oferta no borra ni modifica el historial ni la ficha del artículo.
            return { id: supplierMaterialId, materialId };
        });

        return deletedMaterial;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.deleteMaterial',
            ...getModelLogContext('supplierMaterial', { id: supplierMaterialId })
        });

        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) throw new MaterialNotFound();
        if (err.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) throw new MaterialDeleteRelationConflict();
        throw resolveServiceError(err, new MaterialDeleteDatabaseError());
    }
};
