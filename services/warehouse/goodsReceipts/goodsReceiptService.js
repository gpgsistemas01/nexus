import {
    ProfileReceivedByNotFound,
    SupplierNotFound
} from "../../../errors/warehouse/goodsReceiptError.js";
import { prisma } from "../../../lib/prisma.js";
import { generateReferenceNumber } from "../../document/referenceNumberService.js";
import { findProfileById } from "../../admin/profileService.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { findUniqueSupplier } from "../supplierService.js";
import { buildGoodsReceiptDetails } from "./goodsReceiptHelpers.js";
import { updateProductUnitCostIfHigher } from "../products/productService.js";

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
        select: {
            referenceNumber: true,
            receivedById: true,
            receivedByName: true,
            supplierId: true,
            supplierName: true,
            totalGrossPurchaseAmount: true,
            totalNetPurchaseAmount: true,
            totalQuantity: true,
            receptionDate: true,
            id: true,
            details: {
                select: {
                    id: true,
                    productName: true,
                    productBase: true,
                    productHeight: true,
                    quantity: true,
                    presentationId: true,
                    presentationName: true,
                    convertedQuantity: true,
                    unitMeasureId: true,
                    unitMeasureName: true,
                    unitMeasureSymbol: true,
                    costPerUnitType: true,
                    conversionUnitCost: true,
                    netPurchaseAmount: true,
                    grossPurchaseAmount: true,
                    productId: true,
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

    const { receivedById, supplierId, details, ...goodsReceiptData } = goodsReceiptDto;

    const supplier = await findUniqueSupplier({ id: supplierId });

    const receivedBy = await findProfileById({ id: receivedById });

    if (!receivedBy) throw new ProfileReceivedByNotFound();

    const processedDetails = await buildGoodsReceiptDetails(details);

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

    const result = await prisma.$transaction(async (tx) => {

        const referenceNumber = await generateReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

        const goodsReceipt = await tx.goodsReceipt.create({
            data: {
                ...goodsReceiptData,
                ...totals,
                referenceNumber,
                supplierName: supplier.tradeName,
                receivedByName: receivedBy.fullName,
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
                details: {
                    createMany: {
                        data: processedDetails
                    }
                }
            },
            include: {
                details: {
                    select: {
                        id: true,
                        productId: true,
                        quantity: true,
                        conversionUnitCost: true
                    }
                }
            }
        });

        const impactedProductIds = await applyInventoryMovement({
            tx,
            reference: { goodsReceiptId: goodsReceipt.id },
            details: goodsReceipt.details.map(detail => ({
                productId: detail.productId,
                goodsReceiptDetailId: detail.id,
                quantity: detail.quantity
            })),
            movementType: MOVEMENT_TYPE_IN
        });

        await updateProductUnitCostIfHigher({
            tx,
            supplierId: goodsReceipt.supplierId,
            details: goodsReceipt.details
        });

        return { goodsReceipt, impactedProductIds };
    });

    return result;
}