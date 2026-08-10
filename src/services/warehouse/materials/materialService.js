import { MaterialAlreadyExists, MaterialCreateDatabaseError, MaterialInitialStockReasonNotFound, MaterialNotFound, MaterialUpdateDatabaseError, MaterialStockAdjustmentDatabaseError, MaterialDeleteDatabaseError, MaterialDeleteRelationConflict } from "../../../errors/warehouse/materialError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { findAllSupplierMaterials, findSupplierMaterialByIds } from "./supplierMaterialService.js";
import { prepareMaterialData } from "./materialHelpers.js";
import { syncSupplierMaterial } from "./materialRelations.js";
import { isAppError } from "../../../errors/AppError.js";
import { createStockAdjustment } from "../adjustmentService.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { findInitialStockAdjustmentReason } from "../reasonService.js";

const serviceLogger = createServiceLogger('warehouse.materials.materialService');


const throwMaterialWriteError = ({ err, fallbackError }) => {
    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new MaterialNotFound();
    }

    if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) {
        throw new MaterialAlreadyExists();
    }

    if (isAppError(err)) throw err;

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
        height: rest.height ?? null
    },
    select: { id: true }
});

export const findAllMaterials = async ({
    skip = 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    return await findAllSupplierMaterials({
        skip,
        take,
        search,
        supplierId,
        orderBy,
        orderDir
    });
};

const DEFAULT_MATERIAL_SNAPSHOT_SELECT = {
    id: true,
    name: true,
    minStock: true,
    base: true,
    height: true,
    presentation: true,
    unitMeasure: true
};

export const findMaterialsSnapshot = async ({
    tx = null,
    materialIds
}) => {

    const db = getDb(tx);

    const materials = await db.material.findMany({
        where: {
            id: {
                in: materialIds
            }
        },
        select: DEFAULT_MATERIAL_SNAPSHOT_SELECT
    });

    return materials;
}

export const existsMaterial = async ({
    tx,
    id
}) => {

    const db = getDb(tx);

    const materialExists = await db.material.findUnique({
        where: { id },
        select: { id: true }
    });

    if (!materialExists) throw new MaterialNotFound();

    return materialExists;
}

export const createMaterial = async ({
    materialDto,
    userId = null
}) => {

    try {

        const material = await getDb().$transaction(async (tx) => {
            const { newStock, observations, ...materialData } = materialDto;
            const { rest, relations } = await prepareMaterialData({
                tx,
                materialDto: materialData
            });

            const existingMaterial = await findMaterialByIdentity({ tx, rest, relations });
            let materialId = existingMaterial?.id;

            if (existingMaterial) {
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
            } else {
                const createdMaterial = await tx.material.create({
                    data: buildMaterialData({ rest, relations }),
                    select: { id: true }
                });

                materialId = createdMaterial.id;
            }

            await syncSupplierMaterial({
                tx,
                supplierId: relations.supplierId,
                materialId,
                maxUnitCost: relations.maxUnitCost
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
            ...getModelLogContext('material', { ...materialDto, id: material?.materialId ?? material?.id })
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

export const updateMaterial = async (materialDto, id) => {

    try {

        const material = await getDb().$transaction(async (tx) => {

            await existsMaterial({ tx, id });
            const { supplierId, maxUnitCost, ...materialData } = materialDto;

            const currentMaterial = await tx.material.findUnique({
                where: { id },
                select: {
                    id: true,
                    presentationId: true,
                    unitMeasureId: true,
                    base: true,
                    height: true
                }
            });

            const existingMaterial = await tx.material.findFirst({
                where: {
                    name: { equals: materialDto.name, mode: 'insensitive' },
                    presentationId: currentMaterial.presentationId,
                    unitMeasureId: currentMaterial.unitMeasureId,
                    base: currentMaterial.base ?? null,
                    height: currentMaterial.height ?? null,
                    NOT: { id }
                },
                select: { id: true }
            });

            if (existingMaterial) {
                throw new MaterialAlreadyExists();
            }

            const updatedMaterial = await tx.material.update({
                where: { id },
                data: materialData
            });

            await tx.supplierMaterial.update({
                where: {
                    supplierId_materialId: {
                        materialId: updatedMaterial.id,
                        supplierId
                    }
                },
                data: { maxUnitCost }
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

export const deleteMaterial = async (id) => {

    try {

        const deletedMaterial = await getDb().$transaction(async (tx) => {

            await existsMaterial({ tx, id });

            const linkedRecords = await Promise.all([
                tx.goodsReceiptDetail.count({ where: { materialId: id } }),
                tx.goodsIssueDetail.count({ where: { materialId: id } }),
                tx.purchaseRequisitionDetail.count({ where: { materialId: id } }),
                tx.movementDetail.count({ where: { materialId: id } }),
                tx.stockAdjustmentDetail.count({ where: { materialId: id } }),
                tx.waste.count({ where: { supplierMaterial: { materialId: id } } })
            ]);

            if (linkedRecords.some((count) => count > 0)) throw new MaterialDeleteRelationConflict();

            await tx.supplierMaterial.deleteMany({ where: { materialId: id } });

            return tx.material.delete({
                where: { id },
                select: { id: true }
            });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.materials.materialService.deleteMaterial',
            ...getModelLogContext('material', { id })
        }, 'Material y relación con proveedor eliminados correctamente');

        return deletedMaterial;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.materials.materialService.deleteMaterial',
            ...getModelLogContext('material', { id })
        });

        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) throw new MaterialNotFound();
        if (err.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) throw new MaterialDeleteRelationConflict();
        if (isAppError(err)) throw err;

        throw new MaterialDeleteDatabaseError();
    }
};

export const updateMaterialStock = async ({
    materialDto,
    userId,
    id
}) => {

    try {

        const stockAdjustment = await createStockAdjustment({
            materialId: id,
            supplierId: materialDto.supplierId,
            reasonId: materialDto.reasonId,
            observations: materialDto.observations,
            newStock: materialDto.newStock,
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

        if (isAppError(err)) throw err;

        throw new MaterialStockAdjustmentDatabaseError();
    }
};
