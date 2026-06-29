import {
    GoodsIssueNotFound,
    GoodsIssueRequesterProfileNotFound,
    GoodsIssueUpdateDatabaseError,
    GoodsIssueAdvisorProfileNotFound,
    GoodsIssueNotPendingConflict,
    GoodsIssueSuppliedConflict,
    GoodsIssueCreateDatabaseError,
    GoodsIssueInternalClientAdvisorDepartmentConflict,
    GoodsIssueInternalClientProjectNumberConflict
} from "../../../errors/warehouse/goodsIssueError.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueService');

import { getDb } from "../../../repository/baseRepository.js";
import { findProfileById, findProfileWithDepartmentsById } from "../../admin/profileService.js";
import { findDepartmentById } from "../../admin/departmentService.js";
import { generateYearlyReferenceNumber } from "../../document/referenceNumberService.js";
import { findClientById } from "../../sales/clientService.js";
import { buildGoodsIssueDetails, isValidInternalClientAdvisor, isValidInternalClientProjectNumberByDepartment, resolveFulfillmentStatus } from "./goodsIssueHelpers.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { normalizeDecimal } from "../../../utils/formattersUtils.js";
import { AppError } from "../../../errors/AppError.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";

const ROLE_SYSTEM_ADMIN = 'Administrador del sistema';
const ROLE_COORDINATOR = 'Coordinador';
const DEPARTMENT_WAREHOUSE = 'ALMACÉN Y PROVEDURÍA';
const FULFILLMENT_PENDING = 'Pendiente';
const FULFILLMENT_PARTIAL = 'Surtido parcial';
const STATUS_APPROVED = 'Aprobada';
const REFERENCE_NUMBER_TYPE = 'SAL';
const MOVEMENT_TYPE_OUT = 'ISSUE';
const FLOAT_EPSILON = 0.000001;

const GOODS_ISSUE_DETAIL_SELECT = {
    id: true,
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
    unitMeasureSymbol: true,
    projectConvertedQuantity: true,
    convertedQuantityDifference: true,
    suppliedQuantity: true,
    isSupplied: true,
    fulfillmentStatus: true,
    supplierId: true,
    supplierName: true
};

export const findAllGoodsIssues = async ({
    skip = 0,
    take = 10,
    search = '',
    startDate = '',
    endDate = '',
    fulfillmentStatusId = '',
    clientId = '',
    departmentId = '',
    profileId = '',
    orderBy = 'referenceNumber',
    orderDir = 'desc',
    accesses = []
}) => {

    const db = getDb();

    const isAdmin = accesses.some(access => access.role === ROLE_SYSTEM_ADMIN);
    const isWarehouseCoordinator = accesses.some(access => 
        access.role === ROLE_COORDINATOR && 
        access.department === DEPARTMENT_WAREHOUSE
    );
    const canViewAll = isAdmin || isWarehouseCoordinator;
    const userDepartments = accesses.map(a => a.department);

    const where = {
        ...buildDateRangeFilter({ field: 'requestDate', startDate, endDate }),
        ...(clientId && { clientId }),
        ...(departmentId && { departmentId }),
        ...(profileId && { requesterId: profileId }),
        ...(search && {
            OR: [
                {
                    referenceNumber: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    projectNumber: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
        }),
        ...(fulfillmentStatusId && {
            fulfillmentStatusId
        }),
        ...(!canViewAll && {
            department: {
                name: {
                    in: userDepartments
                }
            }
        })
    };

    const goodsIssues = await db.goodsIssue.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        include: {
            status: true,
            fulfillmentStatus: true,
            details: {
                select: GOODS_ISSUE_DETAIL_SELECT
            }
        }
    });

    const total = await db.goodsIssue.count({ where });
    const filtered = total;

    return {
        data: goodsIssues,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const createGoodsIssue = async ({ goodsIssueDto }) => {

    try {

        const { requesterId, advisorId, departmentId, clientId, details, ...goodsIssueData } = goodsIssueDto;

        const requester = await findProfileById({ id: requesterId });

        if (!requester) throw new GoodsIssueRequesterProfileNotFound();
        
        const advisor = await findProfileWithDepartmentsById({ id: advisorId });

        if (!advisor) throw new GoodsIssueAdvisorProfileNotFound();

        const client = await findClientById({ id: clientId });
        const department = await findDepartmentById({ id: departmentId });

        if (!isValidInternalClientAdvisor({ client, advisor })) {
            throw new GoodsIssueInternalClientAdvisorDepartmentConflict();
        }

        if (!isValidInternalClientProjectNumberByDepartment({
            client,
            department,
            projectNumber: goodsIssueData.projectNumber
        })) {
            throw new GoodsIssueInternalClientProjectNumberConflict({
                projectNumber: goodsIssueData.projectNumber,
                departmentName: department.name
            });
        }

        const processedDetails = await buildGoodsIssueDetails({ details });

        const result = await getDb().$transaction(async (tx) => {

            const referenceNumber = await generateYearlyReferenceNumber({ type: REFERENCE_NUMBER_TYPE, tx });

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
                    fulfillmentStatus: {
                        connect: {
                            name: FULFILLMENT_PENDING
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
                        select: GOODS_ISSUE_DETAIL_SELECT
                    }
                }
            });

            return { goodsIssue };
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.goodsIssues.goodsIssueService.createGoodsIssue',
            ...getModelLogContext('goodsIssue', {
                ...goodsIssueDto,
                id: result.goodsIssue.id,
                referenceNumber: result.goodsIssue.referenceNumber
            })
        }, 'Salida de almacén registrada correctamente');

        return result.goodsIssue;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsIssues.goodsIssueService.createGoodsIssue',
            ...getModelLogContext('goodsIssue', goodsIssueDto)
        });

        if (err instanceof AppError) throw err;

        throw new GoodsIssueCreateDatabaseError();
    }
};

export const updateGoodsIssue = async ({ id, goodsIssueDto }) => {

    try {

        const { requesterId, advisorId, departmentId, clientId, details, ...goodsIssueData } = goodsIssueDto;

        const goodsIssue = await getDb().goodsIssue.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                fulfillmentStatus: true,
                details: {
                    select: {
                        id: true,
                        productId: true,
                        supplierId: true,
                        quantity: true,
                        presentationId: true,
                        suppliedQuantity: true,
                        isSupplied: true
                    }
                }
            }
        });

        if (!goodsIssue) throw new GoodsIssueNotFound();

        if (goodsIssue.fulfillmentStatus?.name !== FULFILLMENT_PENDING) throw new GoodsIssueNotPendingConflict();

        const hasSuppliedInAnyDetail = goodsIssue.details.some(
            detail => Number(detail.suppliedQuantity ?? 0) > FLOAT_EPSILON || detail.isSupplied
        );

        if (hasSuppliedInAnyDetail) throw new GoodsIssueSuppliedConflict();

        const requester = await findProfileById({ id: requesterId });

        if (!requester) throw new GoodsIssueRequesterProfileNotFound();

        const advisor = await findProfileWithDepartmentsById({ id: advisorId });

        if (!advisor) throw new GoodsIssueAdvisorProfileNotFound();

        const client = await findClientById({ id: clientId });
        const department = await findDepartmentById({ id: departmentId });

        if (!isValidInternalClientAdvisor({ client, advisor })) {
            throw new GoodsIssueInternalClientAdvisorDepartmentConflict();
        }

        if (!isValidInternalClientProjectNumberByDepartment({
            client,
            department,
            projectNumber: goodsIssueData.projectNumber
        })) {
            throw new GoodsIssueInternalClientProjectNumberConflict({
                projectNumber: goodsIssueData.projectNumber,
                departmentName: department.name
            });
        }

        const processedDetails = await buildGoodsIssueDetails({ details });

        const updatedGoodsIssue = await getDb().$transaction(async (tx) => {

            await tx.goodsIssueDetail.deleteMany({
                where: { goodsIssueId: id }
            });

            await tx.goodsIssueDetail.createMany({
                data: processedDetails.map(d => ({
                    ...d,
                    goodsIssueId: id
                }))
            });

            return await tx.goodsIssue.update({
                where: { id },
                data: {
                    ...goodsIssueData,
                    departmentName: department.name,
                    requesterName: requester.fullName,
                    advisorName: advisor.fullName,
                    clientName: client.name,

                    department: {
                        connect: { id: departmentId }
                    },

                    requester: {
                        connect: { id: requesterId }
                    },

                    advisor: {
                        connect: { id: advisorId }
                    },

                    client: {
                        connect: { id: clientId }
                    },

                    status: {
                        connect: {
                            name: STATUS_APPROVED
                        }
                    },

                    fulfillmentStatus: {
                        connect: {
                            name: FULFILLMENT_PENDING
                        }
                    }
                },
                include: {
                    details: {
                        select: GOODS_ISSUE_DETAIL_SELECT
                    },
                    status: true,
                    fulfillmentStatus: true
                }
            });
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssue',
            ...getModelLogContext('goodsIssue', {
                id,
                ...goodsIssueDto,
                referenceNumber: updatedGoodsIssue.referenceNumber
            })
        }, 'Salida de almacén actualizada correctamente');

        return updatedGoodsIssue;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssue',
            ...getModelLogContext('goodsIssue', { id, ...goodsIssueDto })
        });

        if (err instanceof AppError) throw err;

        throw new GoodsIssueUpdateDatabaseError();
    }
};

export const updateGoodsIssueDetails = async ({ id, goodsIssueDto }) => {

    const { details = [] } = goodsIssueDto;

    try {

        const goodsIssue = await getDb().goodsIssue.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                fulfillmentStatus: true,
                details: {
                    select: {
                        id: true,
                        productId: true,
                        supplierId: true,
                        quantity: true,
                        suppliedQuantity: true,
                        convertedQuantity: true,
                        projectConvertedQuantity: true,
                        productName: true,
                        productBase: true,
                        productHeight: true,
                        supplierName: true
                    }
                }
            }
        });

        if (!goodsIssue) throw new GoodsIssueNotFound();

        if (![FULFILLMENT_PENDING, FULFILLMENT_PARTIAL].includes(goodsIssue.fulfillmentStatus?.name)) {
            throw new GoodsIssueNotPendingConflict();
        }
        const currentById = new Map(goodsIssue.details.map(d => [d.id, d]));
        const updates = [];
        const supplyRequests = [];
        for (const detail of details) {

            const current = currentById.get(detail.id);
            if (!current) continue;

            const currentQuantity = normalizeDecimal(current.quantity ?? 0);
            const currentSupplied = normalizeDecimal(current.suppliedQuantity ?? 0);
            const pending = normalizeDecimal(currentQuantity - currentSupplied);
            const projectConvertedQuantity = detail.projectConvertedQuantity;
            const convertedQuantityDifference = normalizeDecimal(
                normalizeDecimal(current.convertedQuantity ?? 0) - normalizeDecimal(projectConvertedQuantity ?? 0)
            );

            const baseUpdate = {
                projectConvertedQuantity,
                convertedQuantityDifference
            };

            if (!detail.isSupplied || pending <= FLOAT_EPSILON) {
                updates.push({
                    id: current.id,
                    data: baseUpdate
                });
                continue;
            }

            const quantityToSupply = pending;

            supplyRequests.push({
                current,
                currentQuantity,
                quantityToSupply,
                baseUpdate
            });
        }

        return await getDb().$transaction(async (tx) => {

            if (supplyRequests.length) {

                const detailSupplyMovements = supplyRequests.map(({ current, quantityToSupply }) => ({
                    productId: current.productId,
                    supplierId: current.supplierId,
                    goodsIssueDetailId: current.id,
                    quantity: quantityToSupply
                }));

                await applyInventoryMovement({
                    tx,
                    reference: { goodsIssueId: goodsIssue.id },
                    details: detailSupplyMovements,
                    movementType: MOVEMENT_TYPE_OUT
                });

                for (const { current, currentQuantity, quantityToSupply, baseUpdate } of supplyRequests) {

                    const newSupplied = normalizeDecimal(
                        normalizeDecimal(current.suppliedQuantity ?? 0) + quantityToSupply
                    );

                    updates.push({
                        id: current.id,
                        data: {
                            ...baseUpdate,
                            suppliedQuantity: newSupplied,
                            isSupplied: newSupplied >= normalizeDecimal(currentQuantity - FLOAT_EPSILON)
                        }
                    });
                }
            }

            for (const u of updates) {
                await tx.goodsIssueDetail.update({
                    where: { id: u.id },
                    data: u.data
                });
            }

            const refreshed = await tx.goodsIssueDetail.findMany({
                where: { goodsIssueId: id },
                select: {
                    isSupplied: true,
                    quantity: true,
                    suppliedQuantity: true
                }
            });

            const fulfillmentName = resolveFulfillmentStatus(refreshed);

            return await tx.goodsIssue.update({
                where: { id },
                data: {
                    fulfillmentStatus: {
                        connect: { name: fulfillmentName }
                    },
                    status: {
                        connect: { name: STATUS_APPROVED }
                    }
                },
                select: {
                    id: true,
                    status: true,
                    fulfillmentStatus: true,
                    details: {
                        select: GOODS_ISSUE_DETAIL_SELECT
                    }
                }
            });

        });

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssueDetails',
            ...getModelLogContext('goodsIssue', { id, details })
        });

        if (err instanceof AppError) throw err;

        throw new GoodsIssueUpdateDatabaseError();
    }
};

export const updateGoodsIssueHeader = async ({ id, goodsIssueDto }) => {

    try {

        const { requesterId, advisorId, departmentId, clientId, ...goodsIssueData } = goodsIssueDto;

        const goodsIssue = await getDb().goodsIssue.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!goodsIssue) throw new GoodsIssueNotFound();

        const requester = await findProfileById({ id: requesterId });

        if (!requester) throw new GoodsIssueRequesterProfileNotFound();

        const advisor = await findProfileWithDepartmentsById({ id: advisorId });

        if (!advisor) throw new GoodsIssueAdvisorProfileNotFound();

        const client = await findClientById({ id: clientId });
        const department = await findDepartmentById({ id: departmentId });

        if (!isValidInternalClientAdvisor({ client, advisor })) {
            throw new GoodsIssueInternalClientAdvisorDepartmentConflict();
        }

        if (!isValidInternalClientProjectNumberByDepartment({
            client,
            department,
            projectNumber: goodsIssueData.projectNumber
        })) {
            throw new GoodsIssueInternalClientProjectNumberConflict({
                projectNumber: goodsIssueData.projectNumber,
                departmentName: department.name
            });
        }

        const updatedGoodsIssue = await getDb().goodsIssue.update({
            where: { id },
            data: {
                ...goodsIssueData,
                departmentName: department.name,
                requesterName: requester.fullName,
                advisorName: advisor.fullName,
                clientName: client.name,
                department: {
                    connect: { id: departmentId }
                },
                requester: {
                    connect: { id: requesterId }
                },
                advisor: {
                    connect: { id: advisorId }
                },
                client: {
                    connect: { id: clientId }
                },
                status: {
                    connect: { name: STATUS_APPROVED }
                }
            },
            include: {
                details: {
                    select: GOODS_ISSUE_DETAIL_SELECT
                },
                status: true,
                fulfillmentStatus: true
            }
        });

        logServiceInfo(serviceLogger, {
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssueHeader',
            ...getModelLogContext('goodsIssue', {
                id,
                ...goodsIssueDto,
                referenceNumber: updatedGoodsIssue.referenceNumber
            })
        }, 'Encabezado de salida actualizado correctamente');

        return updatedGoodsIssue;

    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssueHeader',
            ...getModelLogContext('goodsIssue', { id, ...goodsIssueDto })
        });

        if (err instanceof AppError) throw err;

        throw new GoodsIssueUpdateDatabaseError();
    }
};
