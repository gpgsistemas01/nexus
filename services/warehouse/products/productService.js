import { ProductSnapshotFindDatabaseError, ProductCreateDatabaseError, ProductNotFound, ProductUpdateDatabaseError } from "../../../errors/warehouse/productError.js";
import { prisma } from "../../../lib/prisma.js";
import { findAllSupplierProducts, findSupplierProductByIds } from "./supplierProductService.js";
import { prepareProductData, withRetry } from "./productHelpers.js";
import { syncSupplierProduct } from "./productRelations.js";

const REFERENCE_MOVEMENT_IN = 'IN';
const PRISMA_RECORD_NOT_FOUND = 'P2025';

export const findAllProducts = async ({
    skip = 0,
    take = 10,
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    return await findAllSupplierProducts({
        skip,
        take,
        search,
        supplierId,
        orderBy,
        orderDir
    });
};

export const findProductsSnapshot = async ({
    tx,
    productIds
}) => {

    const db = tx || prisma;

    try {

        const products = await db.product.findMany({
            where: {
                id: {
                    in: productIds
                }
            },
            select: {
                id: true,
                name: true,
                minStock: true,
                base: true,
                height: true,
                presentation: true,
                unitMeasure: true
            }
        });

        return products;

    } catch (err) {

        throw new ProductSnapshotFindDatabaseError();
    }
}

export const findExistingSkus = (tx) => async ({ 
    baseSku, 
    excludeProductId 
}) => {

    const where = {
        sku: {
            startsWith: baseSku
        }
    };

    if (excludeProductId) {
        where.NOT = {
            id: excludeProductId
        };
    }

    return tx.product.findMany({
        where,
        select: { sku: true }
    });
};

export const createProduct = async (productDto) => {

    return withRetry(async () => {

        return await prisma.$transaction(async (tx) => {

            const {
                rest,
                sku,
                supplier,
                relations
            } = await prepareProductData({ tx, productDto });

            const createdProduct = await tx.product.create({
                data: {
                    ...rest,
                    sku,
                    presentation: {
                        connect: { id: relations.presentationId }
                    },
                    unitMeasure: {
                        connect: { id: relations.unitMeasureId }
                    }
                },
                select: {
                    id: true
                }
             });

            await syncSupplierProduct({
                tx,
                supplierId: relations.supplierId,
                productId: createdProduct.id,
                sku,
                supplierCode: supplier.code
            });

            const fullProduct = await findSupplierProductByIds({
                tx,
                productId: createdProduct.id,
                supplierId: relations.supplierId
            });

            return fullProduct;
        });

    }).catch((err) => { console.log(err)
        throw new ProductCreateDatabaseError();
    });
};

export const updateProduct = async (productDto, id) => {

    return withRetry(async () => {

        return await prisma.$transaction(async (tx) => {

            const productExists = await tx.product.findUnique({
                where: { id },
                select: { id: true }
            });

            if (!productExists) throw new ProductNotFound();

            const {
                rest,
                sku,
                supplier,
                relations
            } = await prepareProductData({
                tx,
                productDto,
                productId: id
            });

            const updatedProduct = await tx.product.update({
                where: { id },
                data: {
                    ...rest,
                    sku,
                    supplier: {
                        connect: { id: relations.supplierId }
                    },
                    presentation: {
                        connect: { id: relations.presentationId }
                    },
                    unitMeasure: {
                        connect: { id: relations.unitMeasureId }
                    }
                }
            });

            await syncSupplierProduct({
                tx,
                supplierId: relations.supplierId,
                productId: id,
                sku,
                supplierCode: supplier.code,
                isUpdate: true
            });

            const fullProduct = await findSupplierProductByIds({
                tx,
                productId: updatedProduct.id,
                supplierId: relations.supplierId
            });

            return fullProduct;
        });

    }).catch((err) => {

        if (err.code === PRISMA_RECORD_NOT_FOUND) {
            throw new ProductNotFound();
        }

        throw new ProductUpdateDatabaseError();
    });
};