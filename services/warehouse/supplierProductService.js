import { SupplierProductCreateDatabaseError, SupplierProductDeleteDatabaseError } from "../../errors/warehouse/productError.js";
import { prisma } from "../../lib/prisma.js";

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
    orderBy = 'id',
    orderDir = 'asc'
}) => {

    const where = search
        ? {
            product: {
                name: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        }
        : {};

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
                    area: true,
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

    try {

        const db = tx || prisma;

        return db.supplierProduct.create({
            supplierId,
            productId,
            sku: `${ skuProduct }-${ skuSupllier }`
        });

    } catch (err) {

        throw new SupplierProductCreateDatabaseError();
    }
}

export const deleteSupplierProduct = async ({
    tx,
    productId,
    supplierId
}) => {

    try {

        const db = tx || prisma;

        return await db.supplierProduct.delete({
            where: {
                productId,
                supplierId
            }
        });

    } catch (err) {

        throw new SupplierProductDeleteDatabaseError();
    }
}