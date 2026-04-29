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
    GoodsIssueUpdateDatabaseError
} from "../../errors/warehouse/goodsIssueError.js";
import { prisma } from "../../lib/prisma.js";
import { getDepartmentByProfileId } from "../admin/userService.js";

const ROLE_SYSTEM_ADMIN = 'Administrador del sistema';
const ROLE_COORDINATOR = 'Coordinador';
const ROLE_AUXILIARY = 'Auxiliar';
const ROLE_WAREHOUSE_STAFF = 'Almacenista';
const DEPARTMENT_WAREHOUSE = 'Almacén';
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
    orderBy = 'requestDate',
    orderDir = 'asc',
    userDepartment = '',
    userRole = ''
}) => {

    const isAdmin = userRole === ROLE_SYSTEM_ADMIN;
    const isWarehouseCoordinator = userRole === ROLE_COORDINATOR && userDepartment === DEPARTMENT_WAREHOUSE;

    const canViewAll = isAdmin || isWarehouseCoordinator;

    const where = {
        ...(search && {
            referenceNumber: {
                contains: search,
                mode: 'insensitive'
            }
        }),
        ...(!canViewAll && {
            OR: [
                {
                    department: {
                        name: userDepartment
                    }
                }
            ]
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
            department: {
                select: {
                    id: true,
                    name: true
                }
            },
            requester: {
                select: {
                    id: true,
                    fullName: true
                }
            },
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
            project: {
                select: {
                    id: true,
                    referenceNumber: true,
                    name: true
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
                    supplierProduct: {
                        select: {
                            id: true,
                            product: true,
                            supplier: true
                        }
                    },
                    quantity: true
                }
            },
            movements: {
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

    const goodsIssuesWithDispatchStatus = goodsIssues.map((goodsIssue) => ({
        ...goodsIssue,
        dispatchStatus: getDispatchStatus({
            details: goodsIssue.details,
            movement: goodsIssue.movement
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

const resolveProjectIdByReferenceNumber = async ({ referenceNumber }) => {

    const project = await prisma.project.findFirst({
        where: {
            referenceNumber: {
                equals: referenceNumber,
                mode: 'insensitive'
            }
        },
        select: { id: true }
    });

    if (!project) throw new GoodsIssueProjectNotFound();

    return project.id;
};

const validateGoodsIssueRelations = async ({ requesterId }) => {

    const requester = await prisma.profile.findUnique({ where: { id: requesterId } });

    if (!requester) throw new GoodsIssueRequesterProfileNotFound();
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
        addQuantityToMap(requestedByProduct, detail.product.id, detail.quantity);
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

    const { requesterId, referenceNumber, details, ...goodsIssueData } = goodsIssueDto;

    await validateGoodsIssueRelations({ requesterId });
    const projectId = await resolveProjectIdByReferenceNumber({ referenceNumber });

    const result = await prisma.$transaction(async (tx) => {

        const departmentId = await getDepartmentByProfileId(requesterId);

        const referenceNumber = await generateReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

        const goodsIssue = await tx.goodsIssue.create({
            data: {
                ...goodsIssueData,
                status: {
                    connect: {
                        name: STATUS_OPEN
                    }
                },
                project: {
                    connect: {
                        id: projectId
                    }
                },
                requester: {
                    connect: {
                        id: requesterId
                    }
                },
                department: {
                    connect: {
                        id: departmentId
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

        return { goodsIssue };
    });

    return result.goodsIssue;
};

export const updateGoodsIssue = async ({
    goodsIssueDto, 
    id,
    canEditDepartment,
    userDepartment,
    userRole
}) => {

    const { requesterId, referenceNumber, details, ...goodsIssueData } = goodsIssueDto;

    await validateGoodsIssueRelations({ requesterId });
    const projectId = await resolveProjectIdByReferenceNumber({ referenceNumber });

    const goodsIssueExists = await prisma.goodsIssue.findUnique({
        where: { id },
        select: {
            id: true,
            department: {
                select: {
                    name: true
                }
            }
        }
    });

    if (!goodsIssueExists) throw new GoodsIssueNotFound();

    const canEditAnyDepartment = userDepartment === DEPARTMENT_WAREHOUSE || userRole === ROLE_SYSTEM_ADMIN;

    if (!canEditAnyDepartment && goodsIssueExists.department?.name !== userDepartment) {
        throw new GoodsIssueEditForbidden();
    }

    try {

        const result = await prisma.$transaction(async (tx) => {

            const departmentId = await getDepartmentByProfileId(requesterId);

            const updatedData = {
                ...goodsIssueData,
                project: {
                    connect: {
                        id: projectId
                    }
                },
                requester: {
                    connect: {
                        id: requesterId
                    }
                }
            };

            if (canEditDepartment) {
                updatedData.department = {
                    connect: {
                        id: departmentId
                    }
                };
            }

            const goodsIssue = await tx.goodsIssue.update({
                data: updatedData,
                where: { id }
            });

            const incomingDetailsIds = details.map(detail => detail.id).filter(Boolean);
            const deleteFilter = { goodsIssueId: id };

            if (incomingDetailsIds.length) deleteFilter.id = { notIn: incomingDetailsIds };

            await tx.detailGoodsIssueProduct.deleteMany({
                where: deleteFilter
            });

            const detailsGoodsIssue = [];

            for (const detail of details) {
                const detailGoodsIssue = await tx.detailGoodsIssueProduct.create({
                    data: {
                        ...detail,
                        goodsIssueId: id
                    }
                });

                detailsGoodsIssue.push(detailGoodsIssue);
            }

            goodsIssue.details = detailsGoodsIssue;

            return { goodsIssue };
        });

        return result.goodsIssue;
    } catch (err) {

        if (err.code === PRISMA_RECORD_NOT_FOUND) throw new GoodsIssueNotFound();

        throw new GoodsIssueUpdateDatabaseError();
    }
};

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

                const detailsToDispatch = pendingProducts
                    .map((product) => {
                        const currentStock = stockByProduct.get(product.productId) || 0;
                        const quantityToDispatch = Math.min(product.pendingQuantity, Math.max(currentStock, 0));

                        if (quantityToDispatch <= FLOAT_EPSILON) return null;

                        return {
                            productId: product.productId,
                            quantity: quantityToDispatch
                        };
                    })
                    .filter(Boolean);

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

                const isFullyDispatched = Array.from(requestedByProduct.entries()).every(
                    ([productId, requestedQuantity]) =>
                        ((deliveredByProduct.get(productId) || 0) + FLOAT_EPSILON) >= requestedQuantity
                );

                data.status = {
                    connect: {
                        name: isFullyDispatched ? STATUS_CONFIRMED : STATUS_APPROVED
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