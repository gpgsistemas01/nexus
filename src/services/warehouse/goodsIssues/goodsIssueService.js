import {
    GoodsIssueNotFound,
    GoodsIssueRequesterProfileNotFound,
    GoodsIssueUpdateDatabaseError,
    GoodsIssueAdvisorProfileNotFound,
    GoodsIssueNotPendingConflict,
    GoodsIssueCreateDatabaseError,
    GoodsIssueInternalClientAdvisorDepartmentConflict,
    GoodsIssueInternalClientProjectNumberConflict,
    GoodsIssueSuppliedConflict,
    GoodsIssueDetailNotFound,
    GoodsIssueReturnQuantityConflict,
    GoodsIssueReturnStatusConflict,
    GoodsIssueReturnDatabaseError
} from "../../../errors/warehouse/goodsIssueError.js";
import { createServiceLogger, getModelLogContext, logServiceError, logServiceInfo } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueService');

import { getDb } from "../../../repository/baseRepository.js";
import { findProfileById, findProfileWithDepartmentsById } from "../../admin/profileService.js";
import { findDepartmentById } from "../../admin/departmentService.js";
import { generateYearlyReferenceNumber } from "../../document/referenceNumberService.js";
import { findClientById } from "../../sales/clientService.js";
import { findFulfillmentStatusIdByName, findFulfillmentStatusIdsByName } from "../fulfillmentStatusService.js";
import { buildGoodsIssueDetails, isValidInternalClientAdvisor, isValidInternalClientProjectNumberByDepartment, resolveFulfillmentStatus } from "./goodsIssueHelpers.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { normalizeDecimal } from "../../../utils/formattersUtils.js";
import { isAppError } from "../../../errors/AppError.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";
import { ROLE_NAMES } from "../../../constants/roles.js";
import { DEPARTMENT_NAMES } from "../../../constants/departments.js";
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { INVENTORY_MOVEMENT_TYPES } from "../../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../../constants/documentReferenceTypes.js";

const FLOAT_EPSILON = 0.000001;

const resolveDetailFulfillmentStatusName = (detail = {}) => {

    if (detail.isSupplied && (detail.suppliedQuantity ?? 0) > FLOAT_EPSILON && (detail.returnedQuantity ?? 0) >= (detail.suppliedQuantity ?? 0) - FLOAT_EPSILON) {
        return FULFILLMENT_STATUS_NAMES.CANCELED;
    }

    return detail.isSupplied ? FULFILLMENT_STATUS_NAMES.COMPLETE : FULFILLMENT_STATUS_NAMES.PENDING;
};

const resolveGoodsIssueHeaderData = async ({ requesterId, advisorId, departmentId, clientId, goodsIssueData }) => {

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

    return {
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
            connect: { name: GOODS_ISSUE_STATUS_NAMES.APPROVED }
        }
    };
};

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
    returnedQuantity: true,
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

    const isAdmin = accesses.some(access => access.role === ROLE_NAMES.SYSTEM_ADMIN);
    const isWarehouseCoordinator = accesses.some(access =>
        access.role === ROLE_NAMES.COORDINATOR &&
        access.department === DEPARTMENT_NAMES.WAREHOUSE_AND_SUPPLY
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
                where: {
                    fulfillmentStatus: {
                        is: { name: { not: FULFILLMENT_STATUS_NAMES.CANCELED } }
                    }
                },
                select: GOODS_ISSUE_DETAIL_SELECT
            }
        }
    });

    const total = await db.goodsIssue.count({ where });
    const filtered = total;

    const canceledGoodsIssueIds = goodsIssues
        .filter(goodsIssue => goodsIssue.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED)
        .map(goodsIssue => goodsIssue.id);
    const canceledDetails = canceledGoodsIssueIds.length
        ? await db.goodsIssueDetail.findMany({
            where: { goodsIssueId: { in: canceledGoodsIssueIds } },
            select: {
                ...GOODS_ISSUE_DETAIL_SELECT,
                goodsIssueId: true
            }
        })
        : [];
    const canceledDetailsByGoodsIssueId = new Map();

    canceledDetails.forEach(detail => {
        const { goodsIssueId, ...detailData } = detail;
        const currentDetails = canceledDetailsByGoodsIssueId.get(goodsIssueId) || [];
        currentDetails.push(detailData);
        canceledDetailsByGoodsIssueId.set(goodsIssueId, currentDetails);
    });

    const data = goodsIssues.map(goodsIssue => ({
        ...goodsIssue,
        details: goodsIssue.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED
            ? canceledDetailsByGoodsIssueId.get(goodsIssue.id) || []
            : goodsIssue.details
    }));

    return {
        data,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const createGoodsIssue = async ({ goodsIssueDto }) => {

    try {

        const { requesterId, advisorId, departmentId, clientId, details, ...goodsIssueData } = goodsIssueDto;

        const headerData = await resolveGoodsIssueHeaderData({
            requesterId,
            advisorId,
            departmentId,
            clientId,
            goodsIssueData
        });

        const pendingFulfillmentStatusId = await findFulfillmentStatusIdByName({ name: FULFILLMENT_STATUS_NAMES.PENDING });
        const processedDetails = await buildGoodsIssueDetails({
            details,
            initialFulfillmentStatusId: pendingFulfillmentStatusId
        });

        const result = await getDb().$transaction(async (tx) => {

            const referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.GOODS_ISSUE, tx });

            const goodsIssue = await tx.goodsIssue.create({
                data: {
                    ...headerData,
                    referenceNumber,
                    fulfillmentStatus: {
                        connect: {
                            name: FULFILLMENT_STATUS_NAMES.PENDING
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

        if (isAppError(err)) throw err;

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

        if (goodsIssue.fulfillmentStatus?.name !== FULFILLMENT_STATUS_NAMES.PENDING) throw new GoodsIssueNotPendingConflict();

        const hasSuppliedInAnyDetail = goodsIssue.details.some(
            detail => Number(detail.suppliedQuantity ?? 0) > FLOAT_EPSILON || detail.isSupplied
        );

        if (hasSuppliedInAnyDetail) throw new GoodsIssueSuppliedConflict();

        const headerData = await resolveGoodsIssueHeaderData({
            requesterId,
            advisorId,
            departmentId,
            clientId,
            goodsIssueData
        });

        const pendingFulfillmentStatusId = await findFulfillmentStatusIdByName({ name: FULFILLMENT_STATUS_NAMES.PENDING });
        const processedDetails = await buildGoodsIssueDetails({
            details,
            initialFulfillmentStatusId: pendingFulfillmentStatusId
        });

        const updatedGoodsIssue = await getDb().$transaction(async (tx) => {

            await tx.goodsIssueDetail.deleteMany({
                where: { goodsIssueId: id }
            });

            await tx.goodsIssueDetail.createMany({
                data: processedDetails.map(detail => ({
                    ...detail,
                    goodsIssueId: id
                }))
            });

            return await tx.goodsIssue.update({
                where: { id },
                data: {
                    ...headerData,

                    fulfillmentStatus: {
                        connect: {
                            name: FULFILLMENT_STATUS_NAMES.PENDING
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

        if (isAppError(err)) throw err;

        throw new GoodsIssueUpdateDatabaseError();
    }
};

export const updateGoodsIssueDetails = async ({ id, goodsIssueDto }) => {

    const { details = [] } = goodsIssueDto;
    const detailIds = details.map(detail => detail.id);

    try {

        const goodsIssue = await getDb().goodsIssue.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                fulfillmentStatus: true,
                details: {
                    where: { id: { in: detailIds } },
                    select: {
                        id: true,
                        productId: true,
                        supplierId: true,
                        quantity: true,
                        suppliedQuantity: true,
                        returnedQuantity: true,
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

        if (![FULFILLMENT_STATUS_NAMES.PENDING, FULFILLMENT_STATUS_NAMES.PARTIAL].includes(goodsIssue.fulfillmentStatus?.name)) {
            throw new GoodsIssueNotPendingConflict();
        }
        const currentById = new Map(goodsIssue.details.map(d => [d.id, d]));
        const updates = [];
        const supplyRequests = [];
        for (const detail of details) {

            const current = currentById.get(detail.id);
            if (!current) throw new GoodsIssueDetailNotFound();

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

            const statusIdsByName = await findFulfillmentStatusIdsByName({ tx, names: Object.values(FULFILLMENT_STATUS_NAMES) });

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
                    movementType: INVENTORY_MOVEMENT_TYPES.ISSUE
                });

                for (const { current, currentQuantity, quantityToSupply, baseUpdate } of supplyRequests) {

                    const newSupplied = normalizeDecimal(
                        normalizeDecimal(current.suppliedQuantity ?? 0) + quantityToSupply
                    );

                    const isSupplied = newSupplied >= normalizeDecimal(currentQuantity - FLOAT_EPSILON);

                    updates.push({
                        id: current.id,
                        data: {
                            ...baseUpdate,
                            suppliedQuantity: newSupplied,
                            isSupplied,
                            fulfillmentStatusId: statusIdsByName.get(resolveDetailFulfillmentStatusName({
                                ...current,
                                suppliedQuantity: newSupplied,
                                isSupplied
                            }))
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
                    suppliedQuantity: true,
                    returnedQuantity: true
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
                        connect: { name: GOODS_ISSUE_STATUS_NAMES.APPROVED }
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

        if (isAppError(err)) throw err;

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

        const headerData = await resolveGoodsIssueHeaderData({
            requesterId,
            advisorId,
            departmentId,
            clientId,
            goodsIssueData
        });

        const updatedGoodsIssue = await getDb().goodsIssue.update({
            where: { id },
            data: {
                ...headerData
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

        if (isAppError(err)) throw err;

        throw new GoodsIssueUpdateDatabaseError();
    }
};


export const returnGoodsIssueDetail = async ({ id, detailId, returnDto, userId }) => {

    const { returnQuantity: requestedReturnQuantityInput, observations = null } = returnDto;

    try {
        const db = getDb();

        return await db.$transaction(async (tx) => {
            const statusIdsByName = await findFulfillmentStatusIdsByName({ tx, names: Object.values(FULFILLMENT_STATUS_NAMES) });
            const detail = await tx.goodsIssueDetail.findFirst({
                where: { id: detailId, goodsIssueId: id },
                include: {
                    goodsIssue: {
                        include: { fulfillmentStatus: true }
                    }
                }
            });

            if (!detail) throw new GoodsIssueDetailNotFound();

            if (detail.goodsIssue.fulfillmentStatus?.name !== FULFILLMENT_STATUS_NAMES.COMPLETE) {
                throw new GoodsIssueReturnStatusConflict();
            }

            const totalSuppliedQuantity = normalizeDecimal(detail.suppliedQuantity ?? 0);
            const currentTotalReturnedQuantity = normalizeDecimal(detail.returnedQuantity ?? 0);
            const requestedReturnQuantity = normalizeDecimal(requestedReturnQuantityInput);
            const newTotalReturnedQuantity = normalizeDecimal(currentTotalReturnedQuantity + requestedReturnQuantity);
            const availableReturnQuantity = normalizeDecimal(totalSuppliedQuantity - currentTotalReturnedQuantity);

            if (
                requestedReturnQuantity <= FLOAT_EPSILON ||
                requestedReturnQuantity > availableReturnQuantity ||
                newTotalReturnedQuantity > totalSuppliedQuantity
            ) {
                throw new GoodsIssueReturnQuantityConflict();
            }

            const movement = await applyInventoryMovement({
                tx,
                reference: { goodsIssueId: id },
                details: [{
                    productId: detail.productId,
                    supplierId: detail.supplierId,
                    goodsIssueDetailId: detail.id,
                    quantity: requestedReturnQuantity
                }],
                movementType: INVENTORY_MOVEMENT_TYPES.ENTRY
            });

            const updatedDetail = await tx.goodsIssueDetail.update({
                where: { id: detail.id },
                data: {
                    returnedQuantity: newTotalReturnedQuantity,
                    fulfillmentStatusId: statusIdsByName.get(resolveDetailFulfillmentStatusName({
                        ...detail,
                        returnedQuantity: newTotalReturnedQuantity
                    }))
                },
                select: GOODS_ISSUE_DETAIL_SELECT
            });

            const refreshedDetails = await tx.goodsIssueDetail.findMany({
                where: { goodsIssueId: id },
                select: {
                    isSupplied: true,
                    suppliedQuantity: true,
                    returnedQuantity: true,
                    fulfillmentStatus: true
                }
            });
            const fulfillmentName = resolveFulfillmentStatus(refreshedDetails);

            await tx.goodsIssue.update({
                where: { id },
                data: {
                    fulfillmentStatus: {
                        connect: { name: fulfillmentName }
                    },
                    status: {
                        connect: {
                            name: fulfillmentName === FULFILLMENT_STATUS_NAMES.CANCELED
                                ? GOODS_ISSUE_STATUS_NAMES.CANCELED
                                : GOODS_ISSUE_STATUS_NAMES.APPROVED
                        }
                    }
                }
            });

            const goodsIssueReturn = await tx.goodsIssueReturn.create({
                data: {
                    goodsIssueId: id,
                    goodsIssueDetailId: detail.id,
                    movementDetailId: movement.details[0]?.id || null,
                    returnedById: userId,
                    productId: detail.productId,
                    productName: detail.productName,
                    supplierId: detail.supplierId,
                    supplierName: detail.supplierName,
                    productBase: detail.productBase,
                    productHeight: detail.productHeight,
                    currentTotalReturnedQuantity: currentTotalReturnedQuantity,
                    newTotalReturnedQuantity: newTotalReturnedQuantity,
                    observations
                },
                include: {
                    movementDetail: true,
                    returnedBy: true
                }
            });

            return {
                ...goodsIssueReturn,
                detail: updatedDetail
            };
        });
    } catch (err) {
        logServiceError(serviceLogger, err, {
            operation: 'warehouse.goodsIssues.goodsIssueService.returnGoodsIssueDetail',
            ...getModelLogContext('goodsIssueReturn', { id, detailId, ...returnDto })
        });

        if (isAppError(err)) throw err;

        throw new GoodsIssueReturnDatabaseError();
    }
};
