import {
    ProfileReceivedByNotFound,
    GoodsReceiptNotFound,
    GoodsReceiptUpdateDatabaseError,
    SupplierNotFound,
    GoodsReceiptStatusNotFound,
    GoodsReceiptReceptionDateRequired,
    GoodsReceiptStatusUpdateDatabaseError,
    GoodsReceiptApproverProfileNotFound
} from "../../errors/warehouse/goodsReceiptError.js";
import { prisma } from "../../lib/prisma.js";
import { getDepartmentByProfileId } from "../admin/userService.js";
import { generateReferenceNumber } from "../document/referenceNumberService.js";
import { findProfileById, findProfileByUserId } from "../admin/profileService.js";
import { applyInventoryMovement } from "../inventory/movementService.js";

const REFERENCE_NUMBER_TYPE = 'REC';
const REFERENCE_TYPE_GOODS_RECEIPT = 'GOODS_RECEIPT';
const MOVEMENT_TYPE_IN = 'IN';
const STATUS_OPEN = 'Abierta';
const STATUS_CONFIRMED = 'Confirmada';
const STATUS_CANCELED = 'Cancelada';
const PRISMA_RECORD_NOT_FOUND = 'P2025';

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
            approver: {
                select: {
                    id: true,
                    name: true,
                    lastName: true
                }
            },
            supplier: {
                select: {
                    id: true,
                    tradeName: true
                }
            },
            status: {
                select: {
                    id: true,
                    name: true
                }
            },
            details: {
                select: {
                    id: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            presentation: true,
                            base: true,
                            height: true
                        }
                    },
                    quantity: true,
                    unitCost: true,
                    amount: true
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

export const createGoodsReceipt = async (goodsReceiptDto) => {

    const { receivedById, supplierId, details, ...goodsReceiptData } = goodsReceiptDto;

    await validateGoodsReceiptRelations({ receivedById, supplierId });

    const departmentId = await getDepartmentByProfileId(receivedById);

    const result = await prisma.$transaction(async (tx) => {

        await findProfileById({ tx, id: receivedById });

        const referenceNumber = await generateReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

        const goodsReceipt = await tx.goodsReceipt.create({
            data: {
                ...goodsReceiptData,
                status: {
                    connect: {
                        name: STATUS_OPEN
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
                    create: details.map(({ productId, ...rest }) => ({
                        ...rest,
                        product: {
                            connect: {
                                id: productId
                            }
                        }
                    }))
                }
            }
        });

        return { goodsReceipt };
    });

    return result.goodsReceipt;
}

export const updateGoodsReceipt = async (goodsReceiptDto, id) => {

    const { receivedById, supplierId, details, ...goodsReceiptData } = goodsReceiptDto;

    await validateGoodsReceiptRelations({ receivedById, supplierId });

    const goodsReceiptExists = await prisma.goodsReceipt.findUnique({
        where: { id },
        select: {
            id: true
        }
    });

    if (!goodsReceiptExists) throw new GoodsReceiptNotFound();

    try {

        const result = await prisma.$transaction(async (tx) => {

            await findProfileById({ tx, id: receivedById });

            const goodsReceipt = await tx.goodsReceipt.update({
                data: {
                    ...goodsReceiptData,
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
                },
                where: { id }
            });

            const incomingDetailsIds = details.map(detail => detail.id).filter(Boolean);
            const deleteFilter = { goodsReceiptId: id };

            if (incomingDetailsIds.length) deleteFilter.id = { notIn: incomingDetailsIds };

            await tx.detailGoodsReceiptProduct.deleteMany({
                where: deleteFilter
            });

            const detailsGoodsReceipt = await Promise.all(details.map(async detail => {

                return await tx.detailGoodsReceiptProduct.create({
                    data: {
                        ...detail,
                        goodsReceiptId: id
                    }
                });
            }));

            goodsReceipt.details = detailsGoodsReceipt;

            return { goodsReceipt };
        });

        return result;

    } catch (err) {

        if (err.code === PRISMA_RECORD_NOT_FOUND) throw new GoodsReceiptNotFound();

        throw new GoodsReceiptUpdateDatabaseError();
    }
}

const updateGoodsReceiptStatus = async ({ id, statusName, userId }) => {

    try {
        const goodsReceipt = await prisma.goodsReceipt.findUnique({
            where: { id },
            select: {
                id: true,
                receptionDate: true,
                receivedById: true,
                status: {
                    select: {
                        name: true
                    }
                },
                details: {
                    select: {
                        productId: true,
                        quantity: true
                    }
                }
            }
        });

        if (!goodsReceipt) throw new GoodsReceiptNotFound();
        if (!goodsReceipt.receptionDate) throw new GoodsReceiptReceptionDateRequired();
        if (goodsReceipt.status?.name !== STATUS_OPEN) throw new GoodsReceiptStatusNotFound();

        return await prisma.$transaction(async (tx) => {

            const receivedById = await findProfileById({ tx, id: goodsReceipt.receivedById });

            if (!receivedById) throw new ProfileReceivedByNotFound();

            let impactedProductIds = [];

            if (statusName === STATUS_CONFIRMED) {

                impactedProductIds = await applyInventoryMovement({
                    tx,
                    referenceId: id,
                    referenceType: REFERENCE_TYPE_GOODS_RECEIPT,
                    details: goodsReceipt.details,
                    movementType: MOVEMENT_TYPE_IN
                });
            }

            const data = {
                status: {
                    connect: {
                        name: statusName
                    }
                }
            };

            if (statusName === STATUS_CONFIRMED) {
                
                const approver = await findProfileByUserId({ tx, userId });

                if (!approver) throw new GoodsReceiptApproverProfileNotFound();

                data.approver = {
                    connect: {
                        id: approver.id
                    }
                };
                data.approveDate = new Date();
            }

            const updatedGoodsReceipt = await tx.goodsReceipt.update({
                where: { id },
                data,
                select: {
                    id: true,
                    referenceNumber: true,
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    status: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return {
                ...updatedGoodsReceipt,
                impactedProductIds
            };
        });

    } catch (err) {

        if (
            err instanceof ProfileReceivedByNotFound ||
            err instanceof GoodsReceiptNotFound ||
            err instanceof GoodsReceiptReceptionDateRequired ||
            err instanceof GoodsReceiptApproverProfileNotFound
        ) {
            throw new GoodsReceiptStatusUpdateDatabaseError();
        }
        if (err.code === PRISMA_RECORD_NOT_FOUND) throw new GoodsReceiptStatusNotFound();
        throw new GoodsReceiptStatusUpdateDatabaseError();
    }
};

export const confirmGoodsReceipt = async ({ id, userId }) =>
    await updateGoodsReceiptStatus({ id, statusName: STATUS_CONFIRMED, userId });

export const cancelGoodsReceipt = async ({ id, userId }) =>
    await updateGoodsReceiptStatus({ id, statusName: STATUS_CANCELED, userId });
