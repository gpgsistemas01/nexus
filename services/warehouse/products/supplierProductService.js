import { ProductSnapshotFindDatabaseError, SupplierProductCreateDatabaseError, SupplierProductDeleteDatabaseError } from "../../../errors/warehouse/productError.js";
import { prisma } from "../../../lib/prisma.js";

const mapSupplierProduct = (sp) => {

    const { product, supplier } = sp;

    return {
        ...product,
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

    const supplierProducts = await prisma.supplierProduct.findMany({
        skip,
        take,
        where,
        select: {
            id: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    currentStock: true,
                    minStock: true,
                    isActive: true,
                    base: true,
                    height: true,
                    maxUnitCost: true,
                    convertedQuantity: true,
                    presentation: true,
                    unitMeasure: true
                }
            },

            supplier: {
                select: {
                    id: true,
                    code: true,
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

        const isLowStockA = Number(a.product.currentStock) < Number(a.product.minStock);
        const isLowStockB = Number(b.product.currentStock) < Number(b.product.minStock);

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

    const db = tx || prisma;

    const supplierProduct = await db.supplierProduct.findUnique({
        where: { 
            supplierId_productId: { 
                productId, 
                supplierId 
            } 
        },
        select: {
            product: {
                select: {
                    id: true,
                    name: true,
                    currentStock: true,
                    minStock: true,
                    isActive: true,
                    base: true,
                    height: true,
                    unitCost: true,
                    convertedQuantity: true,
                    presentation: true,
                    unitMeasure: true
                }
            },
            supplier: {
                select: {
                    id: true,
                    code: true,
                    tradeName: true
                }
            }
        }
    });

    return mapSupplierProduct(supplierProduct);
};

export const findSupplierProductsSnapshot = async ({
    tx,
    pairs
}) => {

    const db = tx || prisma;

    try {

        const products = await db.supplierProduct.findMany({
            where: {
                OR: pairs
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name:true,
                        base: true,
                        height: true,
                        maxUnitCost: true,
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

        return products.map(mapSupplierProduct);

    } catch (err) {

        throw new ProductSnapshotFindDatabaseError();
    }
}

export const countTotalSupplierProducts = async ({
    where
} = {}) => await prisma.supplierProduct.count({ where });

export const createSupplierProduct = async ({
    tx,
    supplierId,
    productId,
    skuProduct,
    skuSupllier
}) => {

    const db = tx || prisma;

    try {

        return db.supplierProduct.create({
            data: {
                supplierId,
                productId,
                sku: `${ skuProduct }-${ skuSupllier }`
            }
        });

    } catch (err) {

        throw new SupplierProductCreateDatabaseError();
    }
}

export const updateProductUnitCostIfHigher = async ({
    tx,
    supplierId,
    details
}) => {

    const db = tx || prisma;

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

    const productIds = Object.keys(maxCostByProduct);

    const products = await db.product.findMany({
        where: {
            id: { in: productIds }
        },
        select: {
            id: true,
            maxUnitCost: true
        }
    });

    await Promise.all(products.map(product => {

        const newCost = maxCostByProduct[product.id];

        if (newCost > product.maxUnitCost) {
            return db.supplierProduct.update({
                where: { 
                    productId: product.id,
                    supplierId
                },
                data: { maxUnitCost: newCost }
            });
        }

    }));
};

export const deleteSupplierProduct = async ({
    tx,
    productId,
    supplierId
}) => {

    const db = tx || prisma;

    try {

        return await db.supplierProduct.delete({
            where: {
                supplierId_productId: {
                    productId,
                    supplierId
                }
            }
        });

    } catch (err) {

        throw new SupplierProductDeleteDatabaseError();
    }
}