import {
    GoodsReceiptCreateDatabaseError,
    GoodsReceiptNotFound,
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
import { buildGoodsReceiptDetails, calculateGoodsReceiptTotals } from "./goodsReceiptHelpers.js";
import { updateProductUnitCostIfHigher } from "../products/supplierProductService.js";
import { AppError } from "../../../errors/AppError.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";
import { findReturnedQuantityTotalsByDetailIds } from "../returns/returnHelpers.js";
import { GOODS_RECEIPT_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { INVENTORY_MOVEMENT_TYPES } from "../../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../../constants/documentReferenceTypes.js";


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
            status: {
                select: {
                    name: true
                }
            },
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

    const detailIds = [];

    goodsReceipts.forEach(receipt => {
        receipt.details.forEach(detail => {
            detailIds.push(detail.id);
        });
    });
    const returnedByDetailId = await findReturnedQuantityTotalsByDetailIds({
        tx: getDb(),
        detailIds,
        detailField: 'goodsReceiptDetailId',
        normalizeTotal: Math.abs
    });

    goodsReceipts.forEach(receipt => {
        receipt.details.forEach(detail => {
            detail.returnedQuantityTotal = returnedByDetailId.get(detail.id) ?? 0;
        });
    });

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

        const totals = calculateGoodsReceiptTotals(processedDetails);

        const result = await getDb().$transaction(async (tx) => {

            const referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.GOODS_RECEIPT, tx });

            const goodsReceipt = await tx.goodsReceipt.create({
                data: {
                    ...goodsReceiptData,
                    ...totals,
                    referenceNumber,
                    supplierName: supplier.tradeName,
                    receivedByName: receivedBy.fullName,
                    status: {
                        connect: {
                            name: GOODS_RECEIPT_STATUS_NAMES.CONFIRMED
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
                movementType: INVENTORY_MOVEMENT_TYPES.ENTRY
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

        const { receivedById, supplierId: _ignoredSupplierId, details: _ignoredDetails, ...goodsReceiptData } = goodsReceiptDto;

        const goodsReceipt = await getDb().goodsReceipt.findUnique({
            where: { id },
            select: {
                id: true
            }
        });

        if (!goodsReceipt) throw new GoodsReceiptNotFound();

        const receivedBy = await findProfileById({ id: receivedById });

        if (!receivedBy) throw new ProfileReceivedByNotFound();

        const updatedGoodsReceipt = await getDb().goodsReceipt.update({
            where: { id },
            data: {
                ...goodsReceiptData,
                receivedByName: receivedBy.fullName,
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
