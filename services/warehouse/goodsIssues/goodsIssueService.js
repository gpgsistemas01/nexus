import { GoodsIssueInsufficientStock } from "../../../errors/inventory/stockError.js";
import {
    GoodsIssueApprovalForbidden,
    GoodsIssueConfirmationForbidden,
    GoodsIssueEditForbidden,
    GoodsIssueNotFound,
    GoodsIssueProjectNotFound,
    GoodsIssueRequesterProfileNotFound,
    GoodsIssueStatusNotFound,
    GoodsIssueApproverProfileNotFound,
    GoodsIssueWarehouseStaffProfileNotFound,
    GoodsIssueStatusUpdateDatabaseError,
    GoodsIssueUpdateDatabaseError,
    GoodsIssueAdvisorProfileNotFound
} from "../../../errors/warehouse/goodsIssueError.js";
import { prisma } from "../../../lib/prisma.js";
import { findProfileById } from "../../admin/profileService.js";
import { findDepartmentById } from "../../admin/departmentService.js";
import { generateReferenceNumber } from "../../document/referenceNumberService.js";
import { findClientById } from "../../sales/clientService.js";
import { buildGoodsIssueDetails } from "./goodsIssueHelpers.js";

const ROLE_SYSTEM_ADMIN = 'Administrador del sistema';
const ROLE_COORDINATOR = 'Coordinador';
const ROLE_AUXILIARY = 'Auxiliar';
const ROLE_WAREHOUSE_STAFF = 'Almacenista';
const DEPARTMENT_WAREHOUSE = 'ALMACÉN Y PROVEDURÍA';
const STATUS_OPEN = 'Abierta';
const STATUS_APPROVED = 'Aprobada';
const STATUS_REJECTED = 'Rechazada';
const STATUS_CONFIRMED = 'Confirmada';
const STATUS_CANCELED = 'Cancelada';
const REFERENCE_NUMBER_TYPE = 'SAL';
const REASON_INTERNAL_CONSUMPTION = 'Consumo interno';
const WAREHOUSE_DELIVERY_ROLES = [ROLE_COORDINATOR, ROLE_AUXILIARY, ROLE_WAREHOUSE_STAFF];
const PRISMA_RECORD_NOT_FOUND = 'P2025';
const FLOAT_EPSILON = 0.000001;
const DISPATCH_STATUS_NOT_DISPATCHED = 'Sin surtir';
const DISPATCH_STATUS_PARTIAL = 'Surtido parcial';
const DISPATCH_STATUS_COMPLETE = 'Surtido completo';

export const findAllGoodsIssues = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'referenceNumber',
    orderDir = 'asc',
    accesses = []
}) => {

    const isAdmin = accesses.some(access => access.role === ROLE_SYSTEM_ADMIN);
    const isWarehouseCoordinator = accesses.some(access => 
        access.role === ROLE_COORDINATOR && 
        access.department === DEPARTMENT_WAREHOUSE
    );
    const canViewAll = isAdmin || isWarehouseCoordinator;
    const userDepartments = accesses.map(a => a.department);

    const where = {
        ...(search && {
            referenceNumber: {
                contains: search,
                mode: 'insensitive'
            }
        }),
        ...(!canViewAll && {
            department: {
                name: {
                    in: userDepartments
                }
            }
        })
    };

    const goodsIssues = await prisma.goodsIssue.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        include: {
            status: true,
            approver: {
                select: {
                    id: true,
                    fullName: true,
                }
            },
            warehouseStaff: {
                select: {
                    id: true,
                    fullName: true,
                }
            },
            details: {
                select: {
                    id: true,
                    productId: true,
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
                    maxUnitCost: true,
                    projectConvertedQuantity: true,
                    convertedQuantityDifference: true,
                    supplierName: true,
                }
            },
            movements: true
        }
    });

    const goodsIssuesWithDispatchStatus = goodsIssues.map((goodsIssue) => ({
        ...goodsIssue,
        dispatchStatus: getDispatchStatus({
            details: goodsIssue.details,
            movement: goodsIssue.movements
        })
    }));

    const total = await prisma.goodsIssue.count();
    const filtered = await prisma.goodsIssue.count({ where });

    return {
        data: goodsIssuesWithDispatchStatus,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

const getActiveProfileIdByUserId = async ({ tx, userId, errorClass }) => {

    const profile = await tx.profile.findFirst({
        where: {
            isActive: true,
            users: {
                some: {
                    id: userId,
                    isActive: true
                }
            }
        },
        select: {
            id: true
        }
    });

    if (!profile) throw new errorClass();

    return profile.id;
};

const addQuantityToMap = (map, productId, quantity) => {
    const current = map.get(productId) || 0;
    map.set(productId, current + Number(quantity));
};

const getDispatchStatus = ({ details, movement }) => {
    const requestedByProduct = new Map();
    details.forEach((detail) => {
        addQuantityToMap(requestedByProduct, detail.productId, detail.quantity);
    });

    const deliveredByProduct = new Map();
    movement.forEach((entry) => {
        entry.details.forEach((detail) => {
            addQuantityToMap(deliveredByProduct, detail.productId, detail.quantity);
        });
    });

    const totalDelivered = Array.from(deliveredByProduct.values()).reduce((acc, qty) => acc + qty, 0);

    if (totalDelivered <= FLOAT_EPSILON) return DISPATCH_STATUS_NOT_DISPATCHED;

    const isFullyDispatched = Array.from(requestedByProduct.entries()).every(
        ([productId, requestedQuantity]) =>
            ((deliveredByProduct.get(productId) || 0) + FLOAT_EPSILON) >= requestedQuantity
    );

    return isFullyDispatched ? DISPATCH_STATUS_COMPLETE : DISPATCH_STATUS_PARTIAL;
};

export const createGoodsIssue = async ({
    goodsIssueDto
}) => {

    const { requesterId, advisorId, departmentId, clientId, details, ...goodsIssueData } = goodsIssueDto;

    const requester = await findProfileById({ id: requesterId });

    if (!requester) throw new GoodsIssueRequesterProfileNotFound();
    
    const advisor = await findProfileById({ id: advisorId });

    if (!advisor) throw new GoodsIssueAdvisorProfileNotFound();

    const client = await findClientById({ id: clientId });
    const department = await findDepartmentById({ id: departmentId });

    const processedDetails = await buildGoodsIssueDetails({ details });

    const result = await prisma.$transaction(async (tx) => {

        const referenceNumber = await generateReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

        const goodsIssue = await tx.goodsIssue.create({
            data: {
                ...goodsIssueData,
                referenceNumber,
                departmentName: department.name,
                requesterName: requester.fullName,
                advisorName: advisor.fullName,
                clientName: client.name,
                status: {
                    connect: {
                        name: STATUS_APPROVED
                    }
                },
                requester: {
                    connect: {
                        id: requesterId
                    }
                },
                advisor: {
                    connect: {
                        id: advisorId
                    }
                },
                department: {
                    connect: {
                        id: departmentId
                    }
                },
                client: {
                    connect: {
                        id: clientId
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
                        productId: true,
                        quantity: true,
                        convertedQuantity: true,
                        maxUnitCost: true,
                        productName: true,
                        productBase: true,
                        productHeight: true,
                        presentationId: true,
                        presentationName: true,
                        unitMeasureId: true,
                        unitMeasureName: true,
                        unitMeasureSymbol: true
                    }
                }
            }
        });

        return { goodsIssue };
    });

    return result.goodsIssue;
};

export const updateGoodsIssue = async ({ id, goodsIssueDto, canEditDepartment }) => {

    return {};
}

const updateGoodsIssueApprovalStatus = async ({
    id,
    statusName,
    userDepartment,
    userRole,
    userId
}) => {

    const goodsIssue = await prisma.goodsIssue.findUnique({
        where: { id },
        include: {
            department: {
                select: {
                    name: true
                }
            },
            status: {
                select: {
                    name: true
                }
            }
        }
    });

    if (!goodsIssue) throw new GoodsIssueNotFound();
    if (goodsIssue.status?.name !== STATUS_OPEN) throw new GoodsIssueStatusNotFound();

    const isSystemAdmin = userRole === ROLE_SYSTEM_ADMIN;
    const isWarehouseDepartment = userDepartment === DEPARTMENT_WAREHOUSE;
    const canApproveAnyDepartment = isSystemAdmin || isWarehouseDepartment;

    if (
        !canApproveAnyDepartment &&
        goodsIssue.department?.name !== userDepartment
    ) {
        throw new GoodsIssueApprovalForbidden();
    }

    try {

        const data = {
            status: {
                connect: {
                    name: statusName
                }
            }
        };

        if (statusName === STATUS_APPROVED) {
            const approverId = await getActiveProfileIdByUserId({
                tx: prisma,
                userId,
                errorClass: GoodsIssueApproverProfileNotFound
            });

            data.approver = {
                connect: {
                    id: approverId
                }
            };
            data.approvedDate = new Date();
        }

        return await prisma.goodsIssue.update({
            where: { id },
            data,
            select: {
                id: true,
                status: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    } catch (err) {
        if (err.code === PRISMA_RECORD_NOT_FOUND) throw new GoodsIssueStatusNotFound();
        throw new GoodsIssueStatusUpdateDatabaseError();
    }
};

const updateGoodsIssueDeliveryStatus = async ({
    id,
    statusName,
    userDepartment,
    userRole,
    userId
}) => {

    try {
        return await prisma.$transaction(async (tx) => {
            const goodsIssue = await tx.goodsIssue.findUnique({
                where: { id },
                select: {
                    id: true,
                    status: {
                        select: {
                            name: true
                        }
                    },
                    details: {
                        select: {
                            id: true,
                            productId: true,
                            quantity: true
                        }
                    },
                    movement: {
                        select: {
                            details: {
                                select: {
                                    productId: true,
                                    quantity: true
                                }
                            }
                        }
                    }
                }
            });

            if (!goodsIssue) throw new GoodsIssueNotFound();
            if (goodsIssue.status?.name !== STATUS_APPROVED) throw new GoodsIssueStatusNotFound();

            const isSystemAdmin = userRole === ROLE_SYSTEM_ADMIN;
            const canConfirmFromWarehouse = userDepartment === DEPARTMENT_WAREHOUSE &&
                WAREHOUSE_DELIVERY_ROLES.includes(userRole);

            if (!isSystemAdmin && !canConfirmFromWarehouse) {
                throw new GoodsIssueConfirmationForbidden();
            }

            const data = {
                status: {
                    connect: {
                        name: statusName
                    }
                }
            };

            let dispatchedProductIds = [];
            let totalRequestedProducts = 0;

            if (statusName === STATUS_CONFIRMED) {
                const warehouseStaffId = await getActiveProfileIdByUserId({
                    tx,
                    userId,
                    errorClass: GoodsIssueWarehouseStaffProfileNotFound
                });

                const requestedByProduct = new Map();
                goodsIssue.details.forEach((detail) => {
                    addQuantityToMap(requestedByProduct, detail.productId, detail.quantity);
                });
                totalRequestedProducts = requestedByProduct.size;

                const deliveredByProduct = new Map();
                goodsIssue.movement.forEach((movement) => {
                    movement.details.forEach((detail) => {
                        addQuantityToMap(deliveredByProduct, detail.productId, detail.quantity);
                    });
                });

                const pendingProducts = [];
                for (const [productId, requestedQuantity] of requestedByProduct.entries()) {
                    const alreadyDelivered = deliveredByProduct.get(productId) || 0;
                    const pendingQuantity = Math.max(requestedQuantity - alreadyDelivered, 0);
                    if (pendingQuantity > FLOAT_EPSILON) pendingProducts.push({ productId, pendingQuantity });
                }

                const stockProducts = await tx.product.findMany({
                    where: {
                        id: {
                            in: pendingProducts.map((product) => product.productId)
                        }
                    },
                    select: {
                        id: true,
                        currentStock: true
                    }
                });

                const stockByProduct = new Map(
                    stockProducts.map((product) => [product.id, Number(product.currentStock)])
                );

                for (const product of pendingProducts) {

                    const currentStock = stockByProduct.get(product.productId) || 0;

                    if (currentStock + FLOAT_EPSILON < product.pendingQuantity) {
                        throw new GoodsIssueInsufficientStock();
                    }
                }

                const detailsToDispatch = pendingProducts.map((product) => ({
                    productId: product.productId,
                    quantity: product.pendingQuantity
                }));

                if (detailsToDispatch.length) {

                    await tx.inventoryMovement.create({
                        data: {
                            goodsIssueId: goodsIssue.id,
                            reasonId: reason.id,
                            date: new Date(),
                            details: {
                                create: detailsToDispatch
                            }
                        }
                    });

                    for (const detail of detailsToDispatch) {
                        await tx.product.update({
                            where: {
                                id: detail.productId
                            },
                            data: {
                                currentStock: {
                                    decrement: detail.quantity
                                }
                            }
                        });
                    }

                    detailsToDispatch.forEach((detail) => {
                        addQuantityToMap(deliveredByProduct, detail.productId, detail.quantity);
                    });
                }

                dispatchedProductIds = detailsToDispatch.map((detail) => detail.productId);

                data.status = {
                    connect: {
                        name: STATUS_CONFIRMED
                    }
                };

                data.warehouseStaff = {
                    connect: {
                        id: warehouseStaffId
                    }
                };
                data.deliveryDate = new Date();
            }

            const updatedGoodsIssue = await tx.goodsIssue.update({
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
                ...updatedGoodsIssue,
                dispatchedProductIds,
                totalRequestedProducts
            };
        });
    } catch (err) {
        if (err.code === PRISMA_RECORD_NOT_FOUND) throw new GoodsIssueStatusNotFound();
        if (
            err instanceof GoodsIssueNotFound ||
            err instanceof GoodsIssueStatusNotFound ||
            err instanceof GoodsIssueConfirmationForbidden ||
            err instanceof GoodsIssueWarehouseStaffProfileNotFound
        ) {
            throw err;
        }
        throw new GoodsIssueStatusUpdateDatabaseError();
    }
};

export const approveGoodsIssue = async ({ id, userDepartment, userRole, userId }) =>
    await updateGoodsIssueApprovalStatus({ id, statusName: STATUS_APPROVED, userDepartment, userRole, userId });

export const rejectGoodsIssue = async ({ id, userDepartment, userRole, userId }) =>
    await updateGoodsIssueApprovalStatus({ id, statusName: STATUS_REJECTED, userDepartment, userRole, userId });

export const confirmGoodsIssue = async ({ id, userDepartment, userRole, userId }) =>
    await updateGoodsIssueDeliveryStatus({ id, statusName: STATUS_CONFIRMED, userDepartment, userRole, userId });

export const cancelGoodsIssue = async ({ id, userDepartment, userRole, userId }) =>
    await updateGoodsIssueDeliveryStatus({ id, statusName: STATUS_CANCELED, userDepartment, userRole, userId });