import {
    GoodsIssueNotFound,
    GoodsIssueRequesterPersonNotFound,
    GoodsIssueUpdateDatabaseError,
    GoodsIssueAdvisorPersonNotFound,
    GoodsIssueNotPendingConflict,
    GoodsIssueCreateDatabaseError,
    GoodsIssueInternalClientAdvisorDepartmentConflict,
    GoodsIssueInternalClientProjectNumberConflict,
    GoodsIssueSuppliedConflict,
    GoodsIssueDetailNotFound
} from "../../../errors/warehouse/goodsIssueError.js";
import { createServiceLogger, getModelLogContext, logServiceInfo } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueService');

import { getDb } from "../../../repository/baseRepository.js";
import { generateYearlyReferenceNumber, throwIfReferenceNumberAlreadyExists } from "../../document/referenceNumberService.js";
import { findFulfillmentStatusIdByName, findFulfillmentStatusIdsByName } from "../fulfillmentStatusService.js";
import { buildGoodsIssueDetails } from "./goodsIssueHelpers.js";
import { applyInventoryMovement } from "../../inventory/movementService.js";
import { normalizeDecimal } from "../../../utils/formattersUtils.js";
import { handleServiceError } from "../../serviceErrorHandler.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";
import { ROLE_NAMES } from "../../../constants/roles.js";
import { DEPARTMENT_NAMES } from "../../../constants/departments.js";
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { INVENTORY_MOVEMENT_TYPES } from "../../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../../constants/documentReferenceTypes.js";
import { resolveIssueHeaderData } from "../issues/issueHeaderService.js";
import { resolveIssueFulfillmentStatus } from "../issues/issueFulfillmentRules.js";
import { GOODS_ISSUE_DETAIL_SELECT } from './goodsIssueDetailSelect.js';
import { resolveGoodsIssueDetailFulfillmentStatusName } from './goodsIssueFulfillmentRules.js';

const FLOAT_EPSILON = 0.000001;

const GOODS_ISSUE_HEADER_ERROR_TYPES = {
    RequesterNotFound: GoodsIssueRequesterPersonNotFound,
    AdvisorNotFound: GoodsIssueAdvisorPersonNotFound,
    ClientAdvisorConflict: GoodsIssueInternalClientAdvisorDepartmentConflict,
    ProjectNumberConflict: GoodsIssueInternalClientProjectNumberConflict
};


export const findAllGoodsIssues = async ({
    skip = 0,
    take = 10,
    search = '',
    startDate = '',
    endDate = '',
    fulfillmentStatusId = '',
    observationsSearch = '',
    clientId = '',
    departmentId = '',
    personId = '',
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
        ...(personId && { requesterId: personId }),
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
        ...(observationsSearch && {
            observations: {
                contains: observationsSearch,
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
                    OR: [
                        {
                            fulfillmentStatus: {
                                is: { name: { not: FULFILLMENT_STATUS_NAMES.CANCELED } }
                            }
                        },
                        {
                            goodsIssue: {
                                fulfillmentStatus: {
                                    is: { name: FULFILLMENT_STATUS_NAMES.CANCELED }
                                }
                            }
                        }
                    ]
                },
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

    let referenceNumber = null;

    try {

        const { requesterId, advisorId, departmentId, clientId, details, ...goodsIssueData } = goodsIssueDto;

        const headerData = await resolveIssueHeaderData({
            requesterId,
            advisorId,
            departmentId,
            clientId,
            issueData: goodsIssueData,
            errorTypes: GOODS_ISSUE_HEADER_ERROR_TYPES,
            statusName: GOODS_ISSUE_STATUS_NAMES.APPROVED
        });

        const pendingFulfillmentStatusId = await findFulfillmentStatusIdByName({ name: FULFILLMENT_STATUS_NAMES.PENDING });
        const processedDetails = await buildGoodsIssueDetails({
            details,
            initialFulfillmentStatusId: pendingFulfillmentStatusId
        });

        const result = await getDb().$transaction(async (tx) => {

            referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.GOODS_ISSUE, tx });

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
        throwIfReferenceNumberAlreadyExists({ err, referenceNumber });

        handleServiceError({
            logger: serviceLogger,
            error: err,
            operation: 'warehouse.goodsIssues.goodsIssueService.createGoodsIssue',
            model: 'goodsIssue',
            data: goodsIssueDto,
            fallbackError: new GoodsIssueCreateDatabaseError()
        });
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
                        materialId: true,
                        supplierId: true,
                        quantity: true,
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

        const headerData = await resolveIssueHeaderData({
            requesterId,
            advisorId,
            departmentId,
            clientId,
            issueData: goodsIssueData,
            errorTypes: GOODS_ISSUE_HEADER_ERROR_TYPES,
            statusName: GOODS_ISSUE_STATUS_NAMES.APPROVED
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
        handleServiceError({
            logger: serviceLogger,
            error: err,
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssue',
            model: 'goodsIssue',
            data: { id, ...goodsIssueDto },
            fallbackError: new GoodsIssueUpdateDatabaseError()
        });
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

        const headerData = await resolveIssueHeaderData({
            requesterId,
            advisorId,
            departmentId,
            clientId,
            issueData: goodsIssueData,
            errorTypes: GOODS_ISSUE_HEADER_ERROR_TYPES,
            statusName: GOODS_ISSUE_STATUS_NAMES.APPROVED
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
        handleServiceError({
            logger: serviceLogger,
            error: err,
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssueHeader',
            model: 'goodsIssue',
            data: { id, ...goodsIssueDto },
            fallbackError: new GoodsIssueUpdateDatabaseError()
        });
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
                        materialId: true,
                        supplierId: true,
                        quantity: true,
                        suppliedQuantity: true,
                        returnedQuantity: true,
                        convertedQuantity: true,
                        projectConvertedQuantity: true,
                        materialName: true,
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
                    materialId: current.materialId,
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
                            fulfillmentStatusId: statusIdsByName.get(resolveGoodsIssueDetailFulfillmentStatusName({
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

            const fulfillmentName = resolveIssueFulfillmentStatus(refreshed);

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
        handleServiceError({
            logger: serviceLogger,
            error: err,
            operation: 'warehouse.goodsIssues.goodsIssueService.updateGoodsIssueDetails',
            model: 'goodsIssue',
            data: { id, details },
            fallbackError: new GoodsIssueUpdateDatabaseError()
        });
    }
};
