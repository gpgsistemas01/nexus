import {
    ProfileReceivedByNotFound,
    SupplierNotFound
} from "../../../errors/warehouse/goodsReceiptError.js";
import { prisma } from "../../../lib/prisma.js";
import { getDepartmentByProfileId } from "../../admin/userService.js";
import { generateReferenceNumber } from "../../document/referenceNumberService.js";
import { findProfileById } from "../../admin/profileService.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { findUniqueSupplier } from "../supplierService.js";
import { buildGoodsReceiptDetails } from "./goodsReceiptsHelpers.js";
import { updateConvertedQuantityByCurrentStock, updateProductUnitCostIfHigher } from "../products/productService.js";

const REFERENCE_NUMBER_TYPE = 'REC';
const MOVEMENT_TYPE_IN = 'IN';
const STATUS_CONFIRMED = 'Confirmada';


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
                    fullName: true,
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

export const createGoodsReceipt = async ({ goodsReceiptDto }) => {

    const result = await prisma.$transaction(async (tx) => {

        const { receivedById, supplierId, details, ...goodsReceiptData } = goodsReceiptDto;

        await findUniqueSupplier({
            tx,
            id: supplierId
        });

        await findProfileById({ 
            tx, 
            id: receivedById 
        });

        const processedDetails = await buildGoodsReceiptDetails(tx, details);

        const totals = processedDetails.reduce((acc, d) => {
            acc.totalQuantity += d.quantity;
            acc.totalNetPurchaseAmount += d.netPurchaseAmount;
            acc.totalGrossPurchaseAmount += d.grossPurchaseAmount;
            return acc;
        }, {
            totalQuantity: 0,
            totalNetPurchaseAmount: 0,
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
                referenceNumber,
                details: {
                    create: processedDetails.map(({ productId, ...rest }) => ({
                        ...rest,
                        product: {
                            connect: { id: productId }
                        }
                    }))
                }
            },
            include: {
                details: true
            }
        });

        const impactedProductIds = await applyInventoryMovement({
            tx,
            goodsReceiptId: goodsReceipt.id,
            details: goodsReceipt.details,
            movementType: MOVEMENT_TYPE_IN
        });

        await updateProductUnitCostIfHigher({
            tx,
            details: goodsReceipt.details
        });

        await updateConvertedQuantityByCurrentStock({
            tx,
            productIds: impactedProductIds
        });

        return { goodsReceipt, impactedProductIds };
    });

    return result;
}
