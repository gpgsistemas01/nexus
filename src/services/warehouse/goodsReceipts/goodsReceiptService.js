import {
    GoodsReceiptCreateDatabaseError,
    GoodsReceiptInvoiceAlreadyExists,
    GoodsReceiptAlreadyCanceled,
    GoodsReceiptNotFound,
    GoodsReceiptSupplierChangeConflict,
    GoodsReceiptUpdateDatabaseError,
    PersonReceivedByNotFound
} from "../../../errors/warehouse/goodsReceiptError.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('warehouse.goodsReceipts.goodsReceiptService');

import { getDb } from "../../../repository/baseRepository.js";
import { generateYearlyReferenceNumber, throwIfReferenceNumberAlreadyExists } from "../../document/referenceNumberService.js";
import { findPersonById } from "../../admin/person/personService.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { findUniqueSupplier } from "../supplierService.js";
import { buildGoodsReceiptDetails, calculateGoodsReceiptTotals, createGoodsReceiptDetailsAndUpdateTotals, GOODS_RECEIPT_DETAIL_INCLUDE } from "./goodsReceiptHelpers.js";
import { updateMaterialUnitCostIfHigher } from "../materials/supplierMaterialService.js";
import { isAppError } from "../../../errors/AppError.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";
import { GOODS_RECEIPT_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { INVENTORY_MOVEMENT_TYPES } from "../../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../../constants/documentReferenceTypes.js";
import { PRISMA_ERROR_CODES } from "../../../constants/prisma.js";
import { assertGoodsReceiptInvoiceAvailable } from "./goodsReceiptInvoiceService.js";

const throwIfInvoiceAlreadyExists = (err) => {
    if (err?.code !== PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) return;

    const driverConstraint = err.meta?.driverAdapterError?.cause?.constraint;
    const target = err.meta?.target ?? driverConstraint?.fields ?? driverConstraint?.index;
    const isInvoiceTarget = Array.isArray(target)
        ? target.includes('supplierId') && target.includes('invoice')
        : typeof target === 'string' && target.includes('supplierId') && target.includes('invoice');

    if (isInvoiceTarget) {
        throw new GoodsReceiptInvoiceAlreadyExists();
    }
};


export const findAllGoodsReceipts = async ({
    skip = 0,
    take = 10,
    search = '',
    startDate = '',
    endDate = '',
    supplierId = '',
    personId = '',
    excludeCanceled = false,
    activeDetailsOnly = false,
    orderBy = 'referenceNumber',
    orderDir = 'desc'
}) => {

    const where = {
        ...(supplierId && { supplierId }),
        ...(personId && { receivedById: personId }),
        ...(excludeCanceled && {
            status: {
                isNot: { name: GOODS_RECEIPT_STATUS_NAMES.CANCELED }
            }
        }),
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
            supplier: true,
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
                ...(activeDetailsOnly && { where: { status: 'ACTIVE' } }),
                include: GOODS_RECEIPT_DETAIL_INCLUDE
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

    let referenceNumber = null;

    try {

        const { receivedById, supplierId, details, ...goodsReceiptData } = goodsReceiptDto;

        const supplier = await findUniqueSupplier({ id: supplierId });

        await assertGoodsReceiptInvoiceAvailable({
            supplierId,
            invoice: goodsReceiptData.invoice
        });

        const receivedBy = await findPersonById({ id: receivedById });

        if (!receivedBy) throw new PersonReceivedByNotFound();

        const processedDetails = await buildGoodsReceiptDetails(details);

        const totals = calculateGoodsReceiptTotals(processedDetails);

        const result = await getDb().$transaction(async (tx) => {

            referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.GOODS_RECEIPT, tx });

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
                        include: GOODS_RECEIPT_DETAIL_INCLUDE
                    },
                    supplier: true,
                    status: true
                }
            });

            await applyInventoryMovement({
                tx,
                reference: { goodsReceiptId: goodsReceipt.id },
                details: goodsReceipt.details.map(detail => ({
                    materialId: detail.materialId,
                    goodsReceiptDetailId: detail.id,
                    supplierId: goodsReceipt.supplierId,
                    quantity: detail.quantity
                })),
                movementType: INVENTORY_MOVEMENT_TYPES.ENTRY
            });

            return goodsReceipt;
        });

        await updateMaterialUnitCostIfHigher({
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

        if (isAppError(err)) throw err;
        throwIfInvoiceAlreadyExists(err);
        throwIfReferenceNumberAlreadyExists({ err, referenceNumber });

        throw new GoodsReceiptCreateDatabaseError();
    }
}

export const updateGoodsReceipt = async ({ id, goodsReceiptDto }) => {

    try {

        const { receivedById, supplierId, details = [], userId, ...goodsReceiptData } = goodsReceiptDto;
        const newDetails = details.filter(detail => !detail.id);

        const [goodsReceipt, receivedBy] = await Promise.all([
            getDb().goodsReceipt.findUnique({
                where: { id },
                select: {
                    id: true,
                    supplierId: true,
                    status: {
                        select: { name: true }
                    }
                }
            }),
            findPersonById({ id: receivedById })
        ]);

        if (!goodsReceipt) throw new GoodsReceiptNotFound();

        if (goodsReceipt.status.name === GOODS_RECEIPT_STATUS_NAMES.CANCELED) {
            throw new GoodsReceiptAlreadyCanceled();
        }

        if (supplierId !== goodsReceipt.supplierId) {
            throw new GoodsReceiptSupplierChangeConflict();
        }

        if (!receivedBy) throw new PersonReceivedByNotFound();

        await assertGoodsReceiptInvoiceAvailable({
            supplierId: goodsReceipt.supplierId,
            invoice: goodsReceiptData.invoice,
            excludeGoodsReceiptId: id
        });

        let addedDetails = [];

        const updatedGoodsReceipt = await getDb().$transaction(async (tx) => {
            const updatedHeader = await tx.goodsReceipt.update({
                where: { id },
                data: {
                    ...goodsReceiptData,
                    receivedByName: receivedBy.fullName,
                    receivedBy: {
                        connect: { id: receivedById }
                    }
                },
                include: {
                    details: {
                        include: GOODS_RECEIPT_DETAIL_INCLUDE
                    },
                    supplier: true,
                    status: true
                }
            });

            if (!newDetails.length) return updatedHeader;

            const { createdDetails, updatedReceipt } = await createGoodsReceiptDetailsAndUpdateTotals({
                tx,
                goodsReceiptId: id,
                details: newDetails
            });

            await applyInventoryMovement({
                tx,
                reference: { goodsReceiptId: id },
                details: createdDetails.map(detail => ({
                    materialId: detail.materialId,
                    goodsReceiptDetailId: detail.id,
                    supplierId: updatedHeader.supplierId,
                    quantity: detail.quantity
                })),
                movementType: INVENTORY_MOVEMENT_TYPES.ENTRY
            });

            addedDetails = createdDetails;

            return updatedReceipt;
        });

        if (newDetails.length) {
            await updateMaterialUnitCostIfHigher({
                supplierId: updatedGoodsReceipt.supplierId,
                details: addedDetails
            });
        }

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.goodsReceipts.goodsReceiptService.updateGoodsReceipt',
            ...getModelLogContext('goodsReceipt', {
                id,
                ...goodsReceiptDto,
                referenceNumber: updatedGoodsReceipt.referenceNumber
            })
        }, 'Compra actualizada correctamente');

        return updatedGoodsReceipt;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsReceipts.goodsReceiptService.updateGoodsReceipt',
            ...getModelLogContext('goodsReceipt', { id, ...goodsReceiptDto })
        });

        if (isAppError(err)) throw err;

        throwIfInvoiceAlreadyExists(err);

        throw new GoodsReceiptUpdateDatabaseError();
    }
};
