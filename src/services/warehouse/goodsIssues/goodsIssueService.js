import { findPage } from '../../../repository/paginationRepository.js';
import {
    GoodsIssueNotFound,
    GoodsIssueRequesterPersonNotFound,
    GoodsIssueUpdateDatabaseError,
    GoodsIssueAdvisorPersonNotFound,
    GoodsIssueNotPendingConflict,
    GoodsIssueCreateDatabaseError,
    GoodsIssueInternalClientAdvisorDepartmentConflict,
    GoodsIssueInternalClientProjectNumberConflict,
    GoodsIssueSuppliedConflict
} from "../../../errors/warehouse/goodsIssueError.js";
import { createServiceLogger, getModelLogContext, logServiceInfo } from "../../../utils/logger.js";

import { getDb } from "../../../repository/baseRepository.js";
import { lockGoodsIssue } from "../../../repository/warehouse/documentLockRepository.js";
import { generateYearlyReferenceNumber, throwIfReferenceNumberAlreadyExists } from "../../document/referenceNumberService.js";
import { findFulfillmentStatusIdByName } from "../fulfillmentStatusService.js";
import { buildGoodsIssueContextWhere, buildGoodsIssueDetails } from "./goodsIssueHelpers.js";
import { handleServiceError } from "../../serviceErrorHandler.js";
import { buildDateRangeFilter } from "../../../utils/requestQueryUtils.js";
import { DATA_SCOPES, hasDataScope } from "../../../constants/permissions.js";
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { MATERIAL_TYPES } from "../../../constants/inventory.js";
import { DOCUMENT_REFERENCE_TYPES } from "../../../constants/documentReferenceTypes.js";
import { resolveIssueHeaderData } from "../issues/issueHeaderService.js";
import { GOODS_ISSUE_DETAIL_SELECT } from "./goodsIssueDetailSelect.js";

const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueService');

const FLOAT_EPSILON = 0.000001;

const GOODS_ISSUE_HEADER_ERROR_TYPES = {
    RequesterNotFound: GoodsIssueRequesterPersonNotFound,
    AdvisorNotFound: GoodsIssueAdvisorPersonNotFound,
    ClientAdvisorConflict: GoodsIssueInternalClientAdvisorDepartmentConflict,
    ProjectNumberConflict: GoodsIssueInternalClientProjectNumberConflict
};


export const findAllGoodsIssues = async ({
    cursor,
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
    type = MATERIAL_TYPES.MATERIAL,
    accesses = [],
    includeCounts = true,
    includeDetails = true,
    id = null
}) => {

    const db = getDb();

    const canViewAll = hasDataScope(accesses, DATA_SCOPES.GOODS_ISSUES_READ_ALL);
    const userDepartmentIds = accesses.map(access => access.departmentId).filter(Boolean);

    const where = {
        ...(id && { id }),
        ...buildGoodsIssueContextWhere(type),
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
            departmentId: {
                in: userDepartmentIds
            }
        })
    };

    return findPage({
        model: db.goodsIssue,
        totalWhere: where,
        hasFilters: false,
        includeCounts,
        query: {
            skip,
            take,
            ...(cursor && { cursor }),
            where,
            orderBy: [{ [orderBy]: orderDir }, { id: 'asc' }],
            include: {
                status: true,
                fulfillmentStatus: true,
                details: includeDetails && {
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
        }
    });
};

export const createGoodsIssue = async ({ goodsIssueDto, type = MATERIAL_TYPES.MATERIAL }) => {

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
            initialFulfillmentStatusId: pendingFulfillmentStatusId,
            type
        });
        const referenceType = type === MATERIAL_TYPES.CONSUMABLE
            ? DOCUMENT_REFERENCE_TYPES.CONSUMABLE_GOODS_ISSUE
            : DOCUMENT_REFERENCE_TYPES.GOODS_ISSUE;

        const result = await getDb().$transaction(async (tx) => {

            referenceNumber = await generateYearlyReferenceNumber({ type: referenceType, tx });

            const goodsIssue = await tx.goodsIssue.create({
                data: {
                    ...headerData,
                    type,
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

export const updateGoodsIssue = async ({ id, goodsIssueDto, type = MATERIAL_TYPES.MATERIAL }) => {

    try {

        const { requesterId, advisorId, departmentId, clientId, details, ...goodsIssueData } = goodsIssueDto;

        const updatedGoodsIssue = await getDb().$transaction(async tx => {
            await lockGoodsIssue({ tx, id });
            const goodsIssue = await tx.goodsIssue.findUnique({
                where: { id, ...buildGoodsIssueContextWhere(type) },
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
                tx,
                requesterId,
                advisorId,
                departmentId,
                clientId,
                issueData: goodsIssueData,
                errorTypes: GOODS_ISSUE_HEADER_ERROR_TYPES,
                statusName: GOODS_ISSUE_STATUS_NAMES.APPROVED
            });

            const pendingFulfillmentStatusId = await findFulfillmentStatusIdByName({ tx, name: FULFILLMENT_STATUS_NAMES.PENDING });
            const processedDetails = await buildGoodsIssueDetails({
                tx,
                details,
                initialFulfillmentStatusId: pendingFulfillmentStatusId,
                type
            });

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
                where: { id, ...buildGoodsIssueContextWhere(type) },
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

export const updateGoodsIssueHeader = async ({ id, goodsIssueDto, type = MATERIAL_TYPES.MATERIAL }) => {

    try {

        const { requesterId, advisorId, departmentId, clientId, ...goodsIssueData } = goodsIssueDto;

        const updatedGoodsIssue = await getDb().$transaction(async tx => {
            await lockGoodsIssue({ tx, id });
            const goodsIssue = await tx.goodsIssue.findUnique({
                where: { id, ...buildGoodsIssueContextWhere(type) },
                select: { id: true }
            });

            if (!goodsIssue) throw new GoodsIssueNotFound();

            const headerData = await resolveIssueHeaderData({
                tx,
                requesterId,
                advisorId,
                departmentId,
                clientId,
                issueData: goodsIssueData,
                errorTypes: GOODS_ISSUE_HEADER_ERROR_TYPES,
                statusName: GOODS_ISSUE_STATUS_NAMES.APPROVED
            });

            return tx.goodsIssue.update({
                where: { id, ...buildGoodsIssueContextWhere(type) },
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
