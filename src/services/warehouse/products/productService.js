import { ProductSnapshotFindDatabaseError, ProductCreateDatabaseError, ProductNotFound, ProductUpdateDatabaseError, ProductStockAdjustmentDatabaseError } from "../../../errors/warehouse/productError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { findAllSupplierProducts, findCurrentSupplierProductByProductId, findSupplierProductByIds, recalculateConvertedQuantityByProduct } from "./supplierProductService.js";
import { prepareProductData, withRetry } from "./productHelpers.js";
import { syncSupplierProduct } from "./productRelations.js";
import { AppError } from "../../../errors/AppError.js";
import { createStockAdjustment } from "../adjustmentService.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('warehouse.products.productService');


const REFERENCE_MOVEMENT_IN = 'IN';
const PRISMA_RECORD_NOT_FOUND = 'P2025';

const buildProductData = ({ rest, relations }) => ({
    ...rest,
    presentation: {
        connect: { id: relations.presentationId }
    },
    unitMeasure: {
        connect: { id: relations.unitMeasureId }
    }
});

const createProductInTransaction = async ({
    tx,
    productDto,
    stockDto = null,
    userId = null
}) => {

    const {
        rest,
        relations
    } = await prepareProductData({ tx, productDto });

    const createdProduct = await tx.product.create({
        data: buildProductData({ rest, relations }),
        select: {
            id: true
        }
     });

    await syncSupplierProduct({
        tx,
        supplierId: relations.supplierId,
        productId: createdProduct.id,
        maxUnitCost: relations.maxUnitCost
    });

    if (stockDto) {
        return createStockAdjustment({
            tx,
            productId: createdProduct.id,
            supplierId: relations.supplierId,
            reasonId: stockDto.reasonId,
            observations: stockDto.observations,
            newStock: stockDto.newStock,
            userId
        });
    }

    return findSupplierProductByIds({
        tx,
        productId: createdProduct.id,
        supplierId: relations.supplierId
    });
};

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

const DEFAULT_PRODUCT_SNAPSHOT_SELECT = {
    id: true,
    name: true,
    minStock: true,
    base: true,
    height: true,
    presentation: true,
    unitMeasure: true
};

export const findProductsSnapshot = async ({
    tx,
    productIds
}) => {

    const db = getDb(tx);

    const products = await db.product.findMany({
        where: {
            id: {
                in: productIds
            }
        },
        select: DEFAULT_PRODUCT_SNAPSHOT_SELECT
    });

    return products;
}

export const existsProduct = async ({
    tx,
    id
}) => {

    const db = getDb(tx);

    const productExists = await db.product.findUnique({
        where: { id },
        select: { id: true }
    });

    if (!productExists) throw new ProductNotFound();

    return productExists;
}

export const createProduct = async ({
    productDto,
    stockDto = null,
    userId = null
}) => {

    try {

        const product = await getDb().$transaction((tx) =>
            createProductInTransaction({
                tx,
                productDto,
                stockDto,
                userId
            })
        );

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.products.productService.createProduct',
            ...getModelLogContext('product', { userId, ...productDto, ...stockDto, id: product?.productId ?? product?.id })
        }, 'Producto creado correctamente');

        return product;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.products.productService.createProduct',
            ...getModelLogContext('product', { userId, ...productDto, ...stockDto })
        });

        if (err instanceof AppError) throw err;
        
        throw new ProductCreateDatabaseError();
    };
};

export const updateProduct = async (productDto, id) => {

    try {

        const product = await getDb().$transaction(async (tx) => {

            await existsProduct({ tx, id });

            const currentSupplierProduct = await findCurrentSupplierProductByProductId({
                tx,
                productId: id
            });

            const {
                rest,
                relations
            } = await prepareProductData({
                tx,
                productDto,
                productId: id
            });


            const updatedProduct = await tx.product.update({
                where: { id },
                data: buildProductData({ rest, relations })
            });

            await syncSupplierProduct({
                tx,
                supplierId: relations.supplierId,
                previousSupplierId: currentSupplierProduct?.supplierId,
                productId: id,
                maxUnitCost: relations.maxUnitCost
            });

            await recalculateConvertedQuantityByProduct({
                tx,
                productId: id,
                base: updatedProduct.base,
                height: updatedProduct.height
            });

            const fullProduct = await findSupplierProductByIds({
                tx,
                productId: updatedProduct.id,
                supplierId: relations.supplierId
            });

            return fullProduct;
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.products.productService.updateProduct',
            ...getModelLogContext('product', { id, ...productDto })
        }, 'Producto actualizado correctamente');

        return product;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.products.productService.updateProduct',
            ...getModelLogContext('product', { id, ...productDto })
        });

        if (err.code === PRISMA_RECORD_NOT_FOUND) {
            throw new ProductNotFound();
        }

        if (err instanceof AppError) throw err;

        throw new ProductUpdateDatabaseError();
    };
};

export const updateProductStock = async ({ 
    productDto, 
    userId,
    id 
}) => {

    try {

        const stockAdjustment = await createStockAdjustment({
            productId: id,
            supplierId: productDto.supplierId,
            reasonId: productDto.reasonId,
            observations: productDto.observations,
            newStock: productDto.newStock,
            userId
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.products.productService.updateProductStock',
            ...getModelLogContext('productStock', { id, userId, ...productDto })
        }, 'Stock de producto ajustado correctamente');

        return stockAdjustment;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.products.productService.updateProductStock',
            ...getModelLogContext('productStock', { id, userId, ...productDto })
        });

        if (err.code === PRISMA_RECORD_NOT_FOUND) {
            throw new ProductNotFound();
        }

        if (err instanceof AppError) throw err;

        throw new ProductStockAdjustmentDatabaseError();
    }
};
