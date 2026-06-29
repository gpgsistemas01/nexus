import {
    GoodsReceiptCreateDatabaseError,
    GoodsReceiptNotFound,
    GoodsReceiptSupplierChangeConflict,
    GoodsReceiptUpdateDatabaseError,
    ProfileReceivedByNotFound
} from "../../../errors/warehouse/goodsReceiptError.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('warehouse.goodsReceipts.goodsReceiptService');

import { getDb } from "../../../repository/baseRepository.js";
import { generateYearlyReferenceNumber } from "../../document/referenceNumberService.js";
import { findProfileById } from "../../admin/profileService.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { findUniqueSupplier } from "../supplierService.js";
import { buildGoodsReceiptDetails } from "./goodsReceiptHelpers.js";
import { updateProductUnitCostIfHigher } from "../products/supplierProductService.js";
import { AppError } from "../../../errors/AppError.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";

const REFERENCE_NUMBER_TYPE = 'REC';
const MOVEMENT_TYPE_IN = 'ENTRY';
const STATUS_CONFIRMED = 'Confirmada';

export const findAllGoodsReceipts = async ({
    skip = 0,
    take = 10,
    search = '',
    startDate = '',
    endDate = '',
    supplierId = '',
    profileId = '',
    orderBy = 'referenceNumber',
    orderDir = 'desc'
}) => {

    const where = {
        ...(supplierId && { supplierId }),
        ...(profileId && { receivedById: profileId }),
        ...buildDateRangeFilter({ field: 'receptionDate', startDate, endDate }),
        ...(search && {
            OR: [
                {
                    referenceNumber: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    invoice: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        })
    };

    const goodsReceipts = await getDb().goodsReceipt.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        select: {
            referenceNumber: true,
            invoice: true,
            isInvoiced: true,
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

    const total = await getDb().goodsReceipt.count();
    const filtered = await getDb().goodsReceipt.count({ where });

    return {
        data: goodsReceipts,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const createGoodsReceipt = async ({ goodsReceiptDto }) => {

    try {

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

        const result = await getDb().$transaction(async (tx) => {

            const referenceNumber = await generateYearlyReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

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

            await applyInventoryMovement({
                tx,
                reference: { goodsReceiptId: goodsReceipt.id },
                details: goodsReceipt.details.map(detail => ({
                    productId: detail.productId,
                    goodsReceiptDetailId: detail.id,
                    supplierId: goodsReceipt.supplierId,
                    quantity: detail.quantity
                })),
                movementType: MOVEMENT_TYPE_IN
            });

            return goodsReceipt;
        });

        await updateProductUnitCostIfHigher({
            supplierId: result.supplierId,
            details: result.details
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.goodsReceipts.goodsReceiptService.createGoodsReceipt',
            ...getModelLogContext('goodsReceipt', {
                ...goodsReceiptDto,
                id: result.id,
                referenceNumber: result.referenceNumber
            })
        }, 'Compra registrada correctamente');

        return result;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsReceipts.goodsReceiptService.createGoodsReceipt',
            ...getModelLogContext('goodsReceipt', goodsReceiptDto)
        });

        if (err instanceof AppError) throw err;

        throw new GoodsReceiptCreateDatabaseError();
    }
}

export const updateGoodsReceiptHeader = async ({ id, goodsReceiptDto }) => {

    try {

        const { receivedById, supplierId, ...goodsReceiptData } = goodsReceiptDto;

        const goodsReceipt = await getDb().goodsReceipt.findUnique({
            where: { id },
            select: {
                id: true,
                supplierId: true
            }
        });

        if (!goodsReceipt) throw new GoodsReceiptNotFound();

        if (goodsReceipt.supplierId !== supplierId) throw new GoodsReceiptSupplierChangeConflict();

        const supplier = await findUniqueSupplier({ id: supplierId });
        const receivedBy = await findProfileById({ id: receivedById });

        if (!receivedBy) throw new ProfileReceivedByNotFound();

        const updatedGoodsReceipt = await getDb().goodsReceipt.update({
            where: { id },
            data: {
                ...goodsReceiptData,
                supplierName: supplier.tradeName,
                receivedByName: receivedBy.fullName,
                supplier: {
                    connect: { id: supplierId }
                },
                receivedBy: {
                    connect: { id: receivedById }
                }
            },
            include: {
                details: true,
                status: true
            }
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.goodsReceipts.goodsReceiptService.updateGoodsReceiptHeader',
            ...getModelLogContext('goodsReceipt', {
                id,
                ...goodsReceiptDto,
                referenceNumber: updatedGoodsReceipt.referenceNumber
            })
        }, 'Encabezado de compra actualizado correctamente');

        return updatedGoodsReceipt;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsReceipts.goodsReceiptService.updateGoodsReceiptHeader',
            ...getModelLogContext('goodsReceipt', { id, ...goodsReceiptDto })
        });

        if (err instanceof AppError) throw err;

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
