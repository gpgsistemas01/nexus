import { findPage } from '../../../repository/paginationRepository.js';
import { MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { getDb } from "../../../repository/baseRepository.js";


const SUPPLIER_MATERIAL_SNAPSHOT_INCLUDE = {
    material: {
        select: {
            id: true,
            version: true,
            type: true,
            name: true,
            base: true,
            height: true,
            presentation: true,
            unitMeasure: true
        }
    },
    supplier: {
        select: {
            id: true,
            tradeName: true,
            isActive: true
        }
    }
};

const MATERIAL_USAGE_RELATIONS = [
    'wasteRolls',
    'goodsReceiptDetails',
    'goodsIssueDetails',
    'movementDetails',
    'stockAdjustmentDetails',
    'previousGoodsReceiptDetailChanges',
    'correctedGoodsReceiptDetailChanges'
];

const buildMaterialUsageFilters = () => MATERIAL_USAGE_RELATIONS.map(relation => ({
    [relation]: { some: {} }
}));

const buildUnusedMaterialFilters = () => MATERIAL_USAGE_RELATIONS.map(relation => ({
    [relation]: { none: {} }
}));

const findDeletableMaterialIds = async ({ db, materialIds }) => {

    if (materialIds.length === 0) return new Set();

    const materials = await db.material.findMany({
        where: {
            id: { in: materialIds },
            AND: buildUnusedMaterialFilters()
        },
        select: { id: true }
    });

    return new Set(materials.map(({ id }) => id));
};

export const existsMaterialUsage = async ({ tx, materialId }) => Boolean(
    await getDb(tx).material.findFirst({
        where: {
            id: materialId,
            OR: buildMaterialUsageFilters()
        },
        select: { id: true }
    })
);

export const findAllSupplierMaterials = async ({
    skip= 0,
    take = 10,
    search = '',
    supplierId = null,
    type = null,
    orderBy = 'id',
    orderDir = 'asc',
    canReadCosts = false
}) => {

    const where = { AND: [] };

    if (search) where.AND.push({
        material: {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        }
    });

    if (supplierId) where.AND.push({
        supplierId
    });

    if (type) where.AND.push({
        material: { type }
    });

    if (where.AND.length === 0) delete where.AND;

    const db = getDb();
    const page = await findPage({
        model: db.supplierMaterial,
        totalWhere: type ? { material: { type } } : undefined,
        hasFilters: Boolean(search || supplierId),
        query: {
            skip,
            take,
            where,
            select: {
                id: true,
                version: true,
                isActive: true,
                referenceConeWeightKg: true,
                referenceRollTotalWeightKg: true,
                ...(canReadCosts && { maxUnitCost: true }),
                currentStock: true,
                convertedQuantity: true,
                material: {
                    select: {
                        id: true,
                        version: true,
                        name: true,
                        minStock: true,
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
            },
            orderBy: {
                material: {
                    [orderBy]: orderDir
                }
            }
        }
    });
    const supplierMaterials = page.data;

    const sorted = supplierMaterials.sort((a, b) => {

        const isLowStockA = Number(a.currentStock) < Number(a.material.minStock);
        const isLowStockB = Number(b.currentStock) < Number(b.material.minStock);

        if (isLowStockA !== isLowStockB) return isLowStockB - isLowStockA;

        return 0;
    });

    const deletableMaterialIds = await findDeletableMaterialIds({
        db,
        materialIds: [...new Set(supplierMaterials.map(({ material }) => material.id))]
    });

    return {
        ...page,
        data: sorted.map(supplierMaterial => ({
            ...supplierMaterial,
            canDelete: deletableMaterialIds.has(supplierMaterial.material.id)
        }))
    };
}

export const findSupplierMaterialByIds = async ({
    tx,
    materialId,
    supplierId
}) => {

    const db = getDb(tx);

    const supplierMaterial = await db.supplierMaterial.findUnique({
        where: {
            supplierId_materialId: {
                materialId,
                supplierId
            }
        },
        select: {
            id: true,
            version: true,
            isActive: true,
            currentStock: true,
            convertedQuantity: true,
            maxUnitCost: true,
            referenceConeWeightKg: true,
            referenceRollTotalWeightKg: true,
            material: {
                select: {
                    id: true,
                    version: true,
                    type: true,
                    name: true,
                    minStock: true,
                    base: true,
                    height: true,
                    presentation: true,
                    unitMeasure: true
                }
            },
            supplier: {
                select: {
                    id: true,
                    tradeName: true,
                    isActive: true
                }
            }
        }
    });

    if (!supplierMaterial) throw new MaterialNotFound();

    return supplierMaterial;
};


export const findSupplierMaterialById = async ({
    tx,
    id
}) => {

    const db = getDb(tx);

    const supplierMaterial = await db.supplierMaterial.findUnique({
        where: { id },
        select: {
            id: true,
            version: true,
            isActive: true,
            currentStock: true,
            convertedQuantity: true,
            maxUnitCost: true,
            referenceConeWeightKg: true,
            referenceRollTotalWeightKg: true,
            material: {
                select: {
                    id: true,
                    version: true,
                    name: true,
                    minStock: true,
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
    });

    if (!supplierMaterial) throw new MaterialNotFound();

    return supplierMaterial;
};

export const findSupplierMaterialsSnapshot = async ({
    tx,
    pairs
}) => {

    const db = getDb(tx);

    const materials = await db.supplierMaterial.findMany({
        where: {
            OR: pairs
        },
        include: SUPPLIER_MATERIAL_SNAPSHOT_INCLUDE
    });

    return materials;
}

export const createSupplierMaterial = async ({
    tx,
    supplierId,
    materialId,
    maxUnitCost,
    isActive
}) => {

    const db = getDb(tx);

    const data = {
        supplierId,
        materialId,
        maxUnitCost,
        ...(isActive !== undefined && { isActive })
    };

    // El alta no puede actualizar una oferta que ganó una carrera concurrente.
    return db.supplierMaterial.create({ data });
};
