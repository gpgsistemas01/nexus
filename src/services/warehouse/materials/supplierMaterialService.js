import { GoodsIssueInexistentStock, GoodsIssueInsufficientStock } from "../../../errors/inventory/stockError.js";
import { MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { buildStockKey, hasMaterialDimensions, normalizeDecimal, parseStockKey } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { INVENTORY_MOVEMENT_TYPES } from "../../../constants/inventory.js";


const buildStockErrorMeta = (ps, requestedQuantity = null) => {

    const hasDimensions = hasMaterialDimensions(ps?.material);

    return {
        materialName: ps?.material?.name ?? 'Material desconocido',
        materialId: ps?.materialId,
        supplierId: ps?.supplierId,
        height: hasDimensions ? ps.material.height : null,
        base: hasDimensions ? ps.material.base : null,
        supplierName: ps?.supplier?.tradeName ?? 'Proveedor desconocido',
        requestedQuantity
    };
};

const SUPPLIER_MATERIAL_SNAPSHOT_INCLUDE = {
    material: {
        select: {
            id: true,
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
            tradeName: true
        }
    }
};

const SUPPLIER_MATERIAL_STOCK_MOVEMENT_SELECT = {
    id: true,
    materialId: true,
    supplierId: true,
    currentStock: true,
    convertedQuantity: true,
    material: {
        select: {
            base: true,
            height: true,
            name: true
        }
    },
    supplier: {
        select: {
            tradeName: true
        }
    }
};

export const findSupplierMaterialsForStockMovement = async ({
    tx,
    where
}) => {

    const db = getDb(tx);

    return db.supplierMaterial.findMany({
        where,
        select: SUPPLIER_MATERIAL_STOCK_MOVEMENT_SELECT
    });
};

export const findCurrentSupplierMaterialByMaterialId = async ({
    tx,
    materialId
}) => {

    const db = getDb(tx);

    const currentSupplierMaterial = await db.supplierMaterial.findFirst({
        where: { materialId },
        select: { supplierId: true }
    });

    return currentSupplierMaterial;
};

export const mapSupplierMaterial = (sp) => {

    const { id, material, supplier, maxUnitCost, currentStock, convertedQuantity, canDelete } = sp;

    return {
        ...material,
        materialId: material.id,
        supplierMaterialId: id,
        maxUnitCost,
        currentStock,
        convertedQuantity,
        ...(canDelete !== undefined && { canDelete }),
        supplier: { ...supplier }
    };
};

const findDeletableMaterialIds = async ({ db, materialIds }) => {

    if (materialIds.length === 0) return new Set();

    const materials = await db.material.findMany({
        where: {
            id: { in: materialIds },
            goodsReceiptDetails: { none: {} },
            goodsIssueDetails: { none: {} },
            purchaseRequisitionsDetails: { none: {} },
            movementDetails: { none: {} },
            stockAdjustmentDetails: { none: {} },
            previousGoodsReceiptDetailChanges: { none: {} },
            correctedGoodsReceiptDetailChanges: { none: {} },
            supplierMaterials: {
                none: {
                    wastes: { some: {} }
                }
            }
        },
        select: { id: true }
    });

    return new Set(materials.map(({ id }) => id));
};

export const findAllSupplierMaterials = async ({
    skip= 0,
    take = 10,
    search = '',
    supplierId = null,
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

    if (where.AND.length === 0) delete where.AND;

    const db = getDb();
    const supplierMaterials = await db.supplierMaterial.findMany({
        skip,
        take,
        where,
        select: {
            id: true,
            ...(canReadCosts && { maxUnitCost: true }),
            currentStock: true,
            convertedQuantity: true,
            material: {
                select: {
                    id: true,
                    name: true,
                    minStock: true,
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
        },
        orderBy: {
            material: {
                [orderBy]: orderDir
            }
        }
    });

    const sorted = supplierMaterials.sort((a, b) => {

        const isLowStockA = Number(a.currentStock) < Number(a.material.minStock);
        const isLowStockB = Number(b.currentStock) < Number(b.material.minStock);

        if (isLowStockA !== isLowStockB) return isLowStockB - isLowStockA;

        return 0;
    });

    const totalPromise = countTotalSupplierMaterials();
    const hasFilters = Object.keys(where).length > 0;
    const [deletableMaterialIds, total, filtered] = await Promise.all([
        findDeletableMaterialIds({
            db,
            materialIds: [...new Set(supplierMaterials.map(({ material }) => material.id))]
        }),
        totalPromise,
        hasFilters ? countTotalSupplierMaterials({ where }) : totalPromise
    ]);

    return {
        data: sorted.map(supplierMaterial => ({
            ...supplierMaterial,
            ...(deletableMaterialIds.has(supplierMaterial.material.id) ? { canDelete: true } : { canDelete: false })
        })),
        recordsTotal: total,
        recordsFiltered: filtered
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
            currentStock: true,
            convertedQuantity: true,
            maxUnitCost: true,
            material: {
                select: {
                    id: true,
                    name: true,
                    minStock: true,
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
    });

    if (!supplierMaterial) throw new MaterialNotFound();

    return mapSupplierMaterial(supplierMaterial);
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
            currentStock: true,
            convertedQuantity: true,
            maxUnitCost: true,
            material: {
                select: {
                    id: true,
                    name: true,
                    minStock: true,
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
    });

    if (!supplierMaterial) throw new MaterialNotFound();

    return mapSupplierMaterial(supplierMaterial);
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

    return materials.map(mapSupplierMaterial);
}

export const countTotalSupplierMaterials = async ({
    where
} = {}) => await getDb().supplierMaterial.count({ where });

export const saveSupplierMaterial = async ({
    tx,
    supplierId,
    materialId,
    maxUnitCost
}) => {

    const db = getDb(tx);

    const data = {
        supplierId,
        materialId,
        maxUnitCost
    };

    return db.supplierMaterial.upsert({
        where: {
            supplierId_materialId: {
                supplierId,
                materialId
            }
        },
        create: data,
        update: {
            maxUnitCost
        }
    });
};


export const recalculateConvertedQuantityByMaterial = async ({
    tx,
    materialId,
    base = null,
    height = null
}) => {

    const db = getDb(tx);

    const query = `
        UPDATE "SupplierMaterial"
        SET "convertedQuantity" = CASE
            WHEN $1::numeric > 0 AND $2::numeric > 0
                THEN ROUND("currentStock" * $1::numeric * $2::numeric, 2)
            ELSE "currentStock"
        END
        WHERE "materialId" = $3::uuid
    `;

    return db.$executeRawUnsafe(query, base, height, materialId);
};
export const updateMaterialUnitCostIfHigher = async ({
    supplierId,
    details
}) => {

    const db = getDb();

    const maxCostByMaterial = new Map();

    for (const detail of details) {

        const { materialId, conversionUnitCost } = detail;

        if (
            !maxCostByMaterial.has(materialId) ||
            Number(conversionUnitCost) > Number(maxCostByMaterial.get(materialId))
        ) {
            maxCostByMaterial.set(materialId, conversionUnitCost);
        }
    }

    if (maxCostByMaterial.size === 0) return { count: 0 };

    const values = [];

    const params = [];

    let paramIndex = 1;

    for (const [materialId, cost] of maxCostByMaterial.entries()) {
        values.push(`($${paramIndex++}::uuid, $${paramIndex++}::numeric)`);
        params.push(materialId, cost);
    }

    const supplierIdParam = `$${paramIndex}::uuid`;

    params.push(supplierId);

    const query = `
        UPDATE "SupplierMaterial" AS sp
        SET "maxUnitCost" = incoming."maxUnitCost"
        FROM (VALUES ${values.join(', ')}) AS incoming("materialId", "maxUnitCost")
        WHERE sp."supplierId" = ${supplierIdParam}
          AND sp."materialId" = incoming."materialId"
          AND (
            sp."maxUnitCost" IS NULL
            OR sp."maxUnitCost" < incoming."maxUnitCost"
          )
    `;

    return db.$executeRawUnsafe(query, ...params);
};

export const recalculateMaterialUnitCosts = async ({ supplierId, materialIds }) => {
    const uniqueMaterialIds = [...new Set(materialIds)];

    if (uniqueMaterialIds.length === 0) return { count: 0 };

    const placeholders = uniqueMaterialIds.map((_, index) => `$${index + 2}::uuid`).join(', ');
    const query = `
        UPDATE "SupplierMaterial" AS sp
        SET "maxUnitCost" = (
            SELECT MAX(detail."conversionUnitCost")
            FROM "GoodsReceiptDetail" AS detail
            INNER JOIN "GoodsReceipt" AS receipt ON receipt."id" = detail."goodsReceiptId"
            WHERE receipt."supplierId" = sp."supplierId"
              AND detail."materialId" = sp."materialId"
              AND detail."status" = 'ACTIVE'
        )
        WHERE sp."supplierId" = $1::uuid
          AND sp."materialId" IN (${placeholders})
    `;

    return getDb().$executeRawUnsafe(query, supplierId, ...uniqueMaterialIds);
};

export const updateSupplierMaterialStock = async ({
    tx,
    grouped,
    movementType,
    supplierMaterials
}) => {

    const db = getDb(tx);

    const psMap = new Map(supplierMaterials.map(ps => [buildStockKey(ps.materialId, ps.supplierId), ps]));

    const operations = [];

    for (const [key, quantity] of grouped.entries()) {

        const { materialId, supplierId } = parseStockKey(key);

        const ps = psMap.get(key);

        if (!ps) throw new GoodsIssueInexistentStock(buildStockErrorMeta(ps));

        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base: ps.material.base,
            height: ps.material.height
        });

        if (movementType !== INVENTORY_MOVEMENT_TYPES.ENTRY) {

            const remainingStock = normalizeDecimal(Number(ps.currentStock ?? 0) - quantity);

            const result = await db.supplierMaterial.updateMany({
                where: {
                    supplierId,
                    materialId,
                    currentStock: { gte: quantity }
                },
                data: {
                    currentStock: { decrement: quantity },
                    convertedQuantity: remainingStock === 0
                        ? 0
                        : { decrement: convertedQuantity }
                }
            });

            if (result.count < 1) {
                throw new GoodsIssueInsufficientStock(buildStockErrorMeta(ps, quantity));
            }

        } else {

            await db.supplierMaterial.update({
                where: {
                    supplierId_materialId: { supplierId, materialId }
                },
                data: {
                    currentStock: { increment: quantity },
                    convertedQuantity: { increment: convertedQuantity }
                }
            });
        }
    }
}

export const adjustSupplierMaterialStock = async ({
    tx,
    materialId,
    supplierId,
    newStock,
    newConvertedQuantity
}) => {

    const db = getDb(tx);

    return await db.supplierMaterial.update({
        where: {
            supplierId_materialId: { materialId, supplierId }
        },
        data: {
            currentStock: newStock,
            convertedQuantity: newConvertedQuantity
        }
    });
};

export const deleteSupplierMaterial = async ({
    tx,
    materialId,
    supplierId
}) => {

    const db = getDb(tx);

    return await db.supplierMaterial.delete({
        where: {
            supplierId_materialId: {materialId, supplierId }
        }
    });
}
