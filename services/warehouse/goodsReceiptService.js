import {
    ProfileReceivedByNotFound,
    SupplierNotFound
} from "../../errors/warehouse/goodsReceiptError.js";
import { prisma } from "../../lib/prisma.js";
import { getDepartmentByProfileId } from "../admin/userService.js";
import { generateReferenceNumber } from "../document/referenceNumberService.js";
import { findProfileById } from "../admin/profileService.js";
import { applyInventoryMovement } from "../inventory/movementService.js";

const REFERENCE_NUMBER_TYPE = 'REC';
const REFERENCE_TYPE_GOODS_RECEIPT = 'GOODS_RECEIPT';
const MOVEMENT_TYPE_IN = 'IN';
const STATUS_CONFIRMED = 'Confirmada';
const IVA_RATE = 1.16;

const roundTo = (value, decimals = 2) => {

    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const buildGoodsReceiptDetails = async (tx, details) => {

    const productIds = details.map(d => d.productId);

    const products = await tx.product.findMany({
        where: {
            id: {
                in: productIds
            }
        },
        select: {
            id: true,
            area: true
        }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    return details.map(({ productId, quantity, unitCostByQuantity }) => {

        const product = productMap.get(productId);

        if (!product) {
            throw new Error(`Producto no encontrado: ${productId}`);
        }

        const area = roundTo(product.area ?? 0);
        const normalizedQuantity = Number(quantity);
        const normalizedUnitCostByQuantity = Number(unitCostByQuantity);
        const netPurchaseAmount = roundTo(normalizedQuantity * normalizedUnitCostByQuantity);
        const grossPurchaseAmount = roundTo(netPurchaseAmount * IVA_RATE);
        const totalArea = roundTo(area * normalizedQuantity);
        const unitCostByArea = totalArea > 0
            ? roundTo(netPurchaseAmount / totalArea)
            : 0;

        return {
            productId,
            quantity: normalizedQuantity,
            area,
            totalArea,
            unitCostByQuantity: normalizedUnitCostByQuantity,
            unitCostByArea,
            netPurchaseAmount,
            grossPurchaseAmount
        };
    });
}

export const findAllGoodsReceipts = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'receptionDate',
    orderDir = 'asc'
}) => {

    const where = search
        ? {
            referenceNumber: {
                contains: search,
                mode: 'insensitive'
            }
        }
        : {};

    const goodsReceipts = await prisma.goodsReceipt.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        include: {
            receivedBy: {
                select: {
                    id: true,
                    name: true,
                    lastName: true
                }
            },
            supplier: {
                select: {
                    id: true,
                    tradeName: true,
                    code: true
                }
            },
            details: {
                select: {
                    id: true,
                    quantity: true,
                    area: true,
                    totalArea: true,
                    unitCostByQuantity: true,
                    unitCostByArea: true,
                    netPurchaseAmount: true,
                    grossPurchaseAmount: true,
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
                            unitMeasure: true,
                        }
                    },
                }
            }
        }
    });

    const total = await prisma.goodsReceipt.count();
    const filtered = await prisma.goodsReceipt.count({ where });

    return {
        data: goodsReceipts,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

const validateGoodsReceiptRelations = async ({ receivedById, supplierId }) => {

    const [supplier, receivedBy] = await Promise.all([
        prisma.supplier.findUnique({
            where: { id: supplierId }
        }),
        prisma.profile.findUnique({
            where: { id: receivedById }
        })
    ]);

    if (!supplier) throw new SupplierNotFound();
    if (!receivedBy) throw new ProfileReceivedByNotFound();
};

const updateConvertedQuantityByCurrentStock = async ({ tx, productIds }) => {

    const uniqueProductIds = [...new Set(productIds)];

    if (!uniqueProductIds.length) return;

    const products = await tx.product.findMany({
        where: {
            id: {
                in: uniqueProductIds
            }
        },
        select: {
            id: true,
            currentStock: true,
            area: true,
            base: true,
            height: true
        }
    });

    await Promise.all(products.map((product) => {

        const area = Number(product.area ?? (product.base * product.height) ?? 0);
        const convertedQuantity = Number(product.currentStock) * area;

        return tx.product.update({
            where: { id: product.id },
            data: {
                convertedQuantity
            }
        });
    }));
};

export const createGoodsReceipt = async ({ goodsReceiptDto }) => {

    const { receivedById, supplierId, details, ...goodsReceiptData } = goodsReceiptDto;

    await validateGoodsReceiptRelations({ receivedById, supplierId });

    const departmentId = await getDepartmentByProfileId(receivedById);

    const result = await prisma.$transaction(async (tx) => {

        await findProfileById({ tx, id: receivedById });

        const processedDetails = await buildGoodsReceiptDetails(tx, details);

        const totals = processedDetails.reduce((acc, d) => {
            acc.totalQuantity += Number(d.quantity);
            acc.totalnetPurchaseAmount += Number(d.netPurchaseAmount);
            acc.totalGrossPurchaseAmount += Number(d.grossPurchaseAmount);
            return acc;
        }, {
            totalQuantity: 0,
            totalnetPurchaseAmount: 0,
            totalGrossPurchaseAmount: 0
        });

        const referenceNumber = await generateReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

        const goodsReceipt = await tx.goodsReceipt.create({
            data: {
                ...goodsReceiptData,
                ...totals,
                status: {
                    connect: {
                        name: STATUS_CONFIRMED
                    }
                },
                supplier: {
                    connect: {
                        id: supplierId
                    }
                },
                receivedBy: {
                    connect: {
                        id: receivedById
                    }
                },
                department: {
                    connect: {
                        id: departmentId,
                    }
                },
                referenceNumber,
                details: {
                    create: processedDetails.map(({ productId, ...rest }) => ({
                        ...rest,
                        product: {
                            connect: { id: productId }
                        }
                    }))
                }
            }
        });

        const impactedProductIds = await applyInventoryMovement({
            tx,
            referenceId: goodsReceipt.id,
            referenceType: REFERENCE_TYPE_GOODS_RECEIPT,
            details: goodsReceipt.details,
            movementType: MOVEMENT_TYPE_IN
        });
        await updateConvertedQuantityByCurrentStock({
            tx,
            productIds: impactedProductIds
        });

        return { goodsReceipt, impactedProductIds };
    });

    return result;
}
