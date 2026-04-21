import { ExcededMaxRetriesSkuError, ProductCreateDatabaseError, ProductNotFound, ProductUpdateDatabaseError } from "../../errors/warehouse/productError.js";
import { prisma } from "../../lib/prisma.js";

const MAX_RETRIES = 5;

const mapProductWithSupplier = (product) => {

    const relation = product.supplierProducts?.[0];
    const supplier = relation?.supplier;

    return {
        ...product,
        supplierId: supplier?.id || null,
        supplierName: supplier ? `${supplier.code} - ${supplier.tradeName}` : null,
        supplierCode: supplier?.code || null,
        supplierProductSku: relation?.sku || null
    };
};

export const findAllProducts = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = search
        ? {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        }
        : {};

    const products = await prisma.product.findMany({
        skip,
        take,
        where,
        include: {
            supplierProducts: {
                include: {
                    supplier: {
                        select: {
                            id: true,
                            code: true,
                            tradeName: true
                        }
                    }
                },
                take: 1,
                orderBy: {
                    id: 'asc'
                }
            }
        },
        orderBy: {
            [orderBy]: orderDir
        }
    });

    const sortedProducts = products.sort((productA, productB) => {

        const isLowStockA = Number(productA.currentStock) < Number(productA.minStock);
        const isLowStockB = Number(productB.currentStock) < Number(productB.minStock);

        if (isLowStockA !== isLowStockB) return isLowStockB - isLowStockA;

        return 0;
    });

    const total = await prisma.product.count();
    const filtered = await prisma.product.count({ where });

    return {
        data: sortedProducts.map(mapProductWithSupplier),
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

const cleanNameForSku = (name = '') => {
    return name
        .replace(/\([^)]*\)/g, ' ')
        .replace(/"[^"]*"/g, ' ')
        .replace(/"/g, ' PUL ')
        .replace(/[.-]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const getChunk = (word) => {

    const normalizedWord = word.toUpperCase().trim();

    if (/^\d+$/.test(normalizedWord)) return normalizedWord;
    if (/^\d+\/\d+$/.test(normalizedWord)) return normalizedWord;
    if (/^[A-Z]\/\d+$/.test(normalizedWord)) return normalizedWord;

    const cleaned = normalizedWord.replace(/[^A-Z0-9]/g, '');

    return cleaned.slice(0, 3);
};

const generateSku = (name) => {

    const cleanedName = cleanNameForSku(name);

    return cleanedName
        .split(' ')
        .map((word) => word.trim())
        .filter(Boolean)
        .map(getChunk)
        .filter(Boolean)
        .join('-');
};

const ensureUniqueSku = async (baseSku, excludeProductId = null) => {

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

    const existingSkus = await prisma.product.findMany({
        where,
        select: { sku: true }
    });

    const escapedBaseSku = baseSku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedBaseSku}(?:-(\\d+))?$`);

    let max = 0;
    let baseExists = false;

    for (const item of existingSkus) {
        const match = item.sku.match(regex);

        if (match) {
            if (match[1]) {
                const num = parseInt(match[1], 10);
                if (num > max) max = num;
            } else {
                baseExists = true;
            }
        }
    }

    if (!baseExists) return baseSku;

    return `${baseSku}-${max + 1}`;
}

const inferPresentation = (base, height) => {

    if (base && height) return (base > 10) ? 'ROLLO' : 'HOJA';

    return 'PIEZA';
}

const buildSupplierProductSku = ({ productSku, supplierCode }) => `${productSku}-${supplierCode}`;

export const createProduct = async (productDto) => {

    let success = false;
    let attempts = 0;

    while (attempts < MAX_RETRIES && !success) {
        try {

            const product = await prisma.$transaction(async (tx) => {

                const sku = generateSku(productDto.name);
                const uniqueSku = await ensureUniqueSku(sku);
                const presentation = inferPresentation(productDto.base, productDto.height);

                const supplier = await tx.supplier.findUnique({
                    where: {
                        id: productDto.supplierId
                    },
                    select: {
                        code: true
                    }
                });

                const createdProduct = await tx.product.create({
                    data: {
                        name: productDto.name,
                        minStock: productDto.minStock,
                        base: productDto.base,
                        height: productDto.height,
                        isActive: productDto.isActive,
                        sku: uniqueSku,
                        presentation
                    }
                });

                if (supplier) {
                    await tx.supplierProduct.create({
                        data: {
                            supplierId: productDto.supplierId,
                            productId: createdProduct.id,
                            sku: buildSupplierProductSku({ productSku: uniqueSku, supplierCode: supplier.code })
                        }
                    });
                }

                return createdProduct;
            });

            success = true;
            return product;

        } catch (err) {

            if (err.code === 'P2002') {

                attempts++;
                continue;
            }

            throw new ProductCreateDatabaseError();
        }
    }

    throw new ExcededMaxRetriesSkuError();
}

export const updateProduct = async (productDto, id) => {

    const productExists = await prisma.product.findUnique({
        where: {
            id
        },
        select: {
            id: true
        }
    });

    if (!productExists) throw new ProductNotFound();

    try {

        const product = await prisma.$transaction(async (tx) => {

            const sku = generateSku(productDto.name);
            const uniqueSku = await ensureUniqueSku(sku, id);
            const presentation = inferPresentation(productDto.base, productDto.height);

            const supplier = await tx.supplier.findUnique({
                where: {
                    id: productDto.supplierId
                },
                select: {
                    code: true
                }
            });

            const updatedProduct = await tx.product.update({
                data: {
                    name: productDto.name,
                    minStock: productDto.minStock,
                    base: productDto.base,
                    height: productDto.height,
                    isActive: productDto.isActive,
                    sku: uniqueSku,
                    presentation
                },
                where: {
                    id
                }
            });

            await tx.supplierProduct.deleteMany({
                where: {
                    productId: id
                }
            });

            if (supplier) {
                await tx.supplierProduct.create({
                    data: {
                        supplierId: productDto.supplierId,
                        productId: id,
                        sku: buildSupplierProductSku({ productSku: uniqueSku, supplierCode: supplier.code })
                    }
                });
            }

            return updatedProduct;
        });

        return product;

    } catch (err) {

        if (err.code === 'P2025') throw new ProductNotFound();

        throw new ProductUpdateDatabaseError();
    }
}
