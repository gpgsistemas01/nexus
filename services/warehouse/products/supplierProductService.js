import { GoodsIssueInexistentStock, GoodsIssueInsufficientStock } from "../../../errors/inventory/stockError.js";
import { ProductNotFound, ProductSnapshotFindDatabaseError, SupplierProductCreateDatabaseError, SupplierProductDeleteDatabaseError } from "../../../errors/warehouse/productError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { buildStockKey, hasProductDimensions, normalizeDecimal, parseStockKey } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { createStockAdjustment } from "../adjustmentService.js";

const MOVEMENT_TYPE_IN = 'ENTRY';

const buildStockErrorMeta = (ps) => {

    const hasDimensions = hasProductDimensions(ps?.product);

    return {
        productName: ps?.product?.name ?? 'Producto desconocido',
        height: hasDimensions ? ps.product.height : null,
        base: hasDimensions ? ps.product.base : null,
        supplierName: ps?.supplier?.tradeName ?? 'Proveedor desconocido'
    };
};

const SUPPLIER_PRODUCT_SNAPSHOT_INCLUDE = {
    product: {
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

const SUPPLIER_PRODUCT_STOCK_MOVEMENT_SELECT = {
    id: true,
    productId: true,
    supplierId: true,
    currentStock: true,
    convertedQuantity: true,
    product: {
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

export const findSupplierProductsForStockMovement = async ({
    tx,
    where
}) => {

    const db = getDb(tx);

    return db.supplierProduct.findMany({
        where,
        select: SUPPLIER_PRODUCT_STOCK_MOVEMENT_SELECT
    });
};

export const findCurrentSupplierProductByProductId = async ({
    tx,
    productId
}) => {

    const db = getDb(tx);

    const currentSupplierProduct = await db.supplierProduct.findFirst({
        where: { productId },
        select: { supplierId: true, maxUnitCost: true }
    });

    return currentSupplierProduct;
};

const mapSupplierProduct = (sp) => {

    const { id, product, supplier, maxUnitCost, currentStock, convertedQuantity } = sp;

    return {
        ...product,
        supplierProductId: id,
        maxUnitCost,
        currentStock,
        convertedQuantity,
        supplier: { ...supplier }
    };
};

export const findAllSupplierProducts = async ({
    skip= 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'id',
    orderDir = 'asc'
}) => {

    const where = { AND: [] };

    if (search) where.AND.push({
        product: {
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

    const supplierProducts = await getDb().supplierProduct.findMany({
        skip,
        take,
        where,
        select: {
            id: true,
            maxUnitCost: true,
            currentStock: true,
            convertedQuantity: true,
            product: {
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
            product: {
                [orderBy]: orderDir
            }
        }
    });

    const sorted = supplierProducts.sort((a, b) => {

        const isLowStockA = Number(a.currentStock) < Number(a.product.minStock);
        const isLowStockB = Number(b.currentStock) < Number(b.product.minStock);

        if (isLowStockA !== isLowStockB) return isLowStockB - isLowStockA;

        return 0;
    });

    const total = await countTotalSupplierProducts();
    const filtered = await countTotalSupplierProducts({ where });

    return {
        data: sorted.map(mapSupplierProduct),
        recordsTotal: total,
        recordsFiltered: filtered
    };
}

export const findSupplierProductByIds = async ({
    tx,
    productId,
    supplierId
}) => {

    const db = getDb(tx);

    const supplierProduct = await db.supplierProduct.findUnique({
        where: { 
            supplierId_productId: { 
                productId, 
                supplierId 
            } 
        },
        select: {
            id: true,
            currentStock: true,
            convertedQuantity: true,
            maxUnitCost: true,
            product: {
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

    if (!supplierProduct) throw new ProductNotFound();

    return mapSupplierProduct(supplierProduct);
};


export const findSupplierProductById = async ({
    tx,
    id
}) => {

    const db = getDb(tx);

    const supplierProduct = await db.supplierProduct.findUnique({
        where: { id },
        select: {
            id: true,
            currentStock: true,
            convertedQuantity: true,
            maxUnitCost: true,
            product: {
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

    if (!supplierProduct) throw new ProductNotFound();

    return mapSupplierProduct(supplierProduct);
};

export const findSupplierProductsSnapshot = async ({
    tx,
    pairs
}) => {

    const db = getDb(tx);

    const products = await db.supplierProduct.findMany({
        where: {
            OR: pairs
        },
        include: SUPPLIER_PRODUCT_SNAPSHOT_INCLUDE
    });

    return products.map(mapSupplierProduct);
}

export const countTotalSupplierProducts = async ({
    where
} = {}) => await getDb().supplierProduct.count({ where });

export const createSupplierProduct = async ({
    tx,
    supplierId,
    productId,
    maxUnitCost = null
}) => {

    const db = getDb(tx);

    return db.supplierProduct.create({
        data: {
            supplierId,
            productId,
            maxUnitCost
        }
    });
}


export const resolveMaxUnitCostForSync = async ({
    tx,
    supplierId,
    productId,
    fallbackMaxUnitCost
}) => {

    const db = getDb(tx);

    const exactSupplierProduct = await db.supplierProduct.findUnique({
        where: {
            supplierId_productId: {
                supplierId,
                productId
            }
        },
        select: { maxUnitCost: true }
    });

    return exactSupplierProduct?.maxUnitCost ?? fallbackMaxUnitCost;
};
export const updateProductUnitCostIfHigher = async ({
    supplierId,
    details
}) => {

    const db = getDb();

    const maxCostByProduct = {};

    for (const detail of details) {

        const { productId, conversionUnitCost } = detail;

        if (
            !maxCostByProduct[productId] ||
            conversionUnitCost > maxCostByProduct[productId]
        ) {
            maxCostByProduct[productId] = conversionUnitCost;
        }
    }

    await Promise.all(
        Object.entries(maxCostByProduct).map(([productId, cost]) =>
            db.supplierProduct.updateMany({
                where: {
                    supplierId,
                    productId,
                    OR: [
                        { maxUnitCost: null },
                        { maxUnitCost: { lt: cost } }
                    ]
                },
                data: {
                    maxUnitCost: cost
                }
            })
        )
    );
};

export const updateSupplierProductStock = async ({
    tx,
    grouped,
    movementType,
    supplierProducts
}) => {

    const db = getDb(tx);

    const psMap = new Map(supplierProducts.map(ps => [buildStockKey(ps.productId, ps.supplierId), ps]));

    const operations = [];

    for (const [key, quantity] of grouped.entries()) {

        const { productId, supplierId } = parseStockKey(key);

        const ps = psMap.get(key);

        if (!ps) throw new GoodsIssueInexistentStock(buildStockErrorMeta(ps));

        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base: ps.product.base,
            height: ps.product.height
        });

        if (movementType !== MOVEMENT_TYPE_IN) {

            const result = await db.supplierProduct.updateMany({
                where: {
                    supplierId,
                    productId,
                    currentStock: { gte: quantity },
                    convertedQuantity: { gte: convertedQuantity }
                },
                data: {
                    currentStock: { decrement: quantity },
                    convertedQuantity: { decrement: convertedQuantity }
                }
            });

            if (result.count < 1) {
                throw new GoodsIssueInsufficientStock(buildStockErrorMeta(ps));
            }

        } else {

            await db.supplierProduct.update({
                where: {
                    supplierId_productId: { supplierId, productId }
                },
                data: {
                    currentStock: { increment: quantity },
                    convertedQuantity: { increment: convertedQuantity }
                }
            });
        }
    }
}

export const adjustSupplierProductStock = async ({
    tx,
    productId,
    supplierId,
    newStock,
    newConvertedQuantity
}) => {
    
    const db = getDb(tx);

    return await db.supplierProduct.update({
        where: {
            supplierId_productId: { productId, supplierId }
        },
        data: {
            currentStock: newStock,
            convertedQuantity: newConvertedQuantity
        }
    });
};

export const deleteSupplierProduct = async ({
    tx,
    productId,
    supplierId
}) => {

    const db = getDb(tx);

    return await db.supplierProduct.delete({
        where: {
            supplierId_productId: {productId, supplierId }
        }
    });
}
