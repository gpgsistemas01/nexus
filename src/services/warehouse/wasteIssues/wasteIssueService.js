import { DOCUMENT_REFERENCE_TYPES } from '../../../constants/documentReferenceTypes.js';
import { PRISMA_ERROR_CODES } from '../../../constants/prisma.js';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import {
    WasteIssueAdvisorNotFound,
    WasteIssueAlreadySuppliedConflict,
    WasteIssueClientAdvisorConflict,
    WasteIssueDetailNotFound,
    WasteIssueNotFound,
    WasteIssueProjectNumberConflict,
    WasteIssueRequesterNotFound,
    WasteIssueCreateDatabaseError,
    WasteIssueUpdateDatabaseError,
    WasteIssueStateConflict
} from '../../../errors/warehouse/wasteIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { generateYearlyReferenceNumber } from '../../document/referenceNumberService.js';
import { resolveIssueHeaderData } from '../issues/issueHeaderService.js';
import {
    resolveIssueDetailFulfillmentStatus,
    resolveIssueFulfillmentStatus
} from '../issues/issueFulfillmentRules.js';
import { applyWasteIssueMovement } from '../wastes/wasteMovementService.js';
import { calculateConvertedQuantity } from '../../inventory/stockHelpers.js';
import { createServiceLogger } from '../../../utils/logger.js';
import { executeServiceOperation } from '../../serviceErrorHandler.js';
import { findWasteIssueFulfillmentStatusIds } from './wasteIssueFulfillmentService.js';
import { buildDateRangeFilter } from '../../../utils/requestQueryUtils.js';

const serviceLogger = createServiceLogger('warehouse.wasteIssues.wasteIssueService');

const normalizeWasteIssueDetailResponse = detail => ({
    ...detail,
    maxUnitCost: detail.maxUnitCost ?? detail.waste?.maxUnitCost ?? null,
    projectConvertedQuantity: detail.projectConvertedQuantity ?? null,
    convertedQuantityDifference: detail.convertedQuantityDifference ?? null
});

const normalizeWasteIssueResponse = issue => issue && ({
    ...issue,
    details: issue.details?.map(normalizeWasteIssueDetailResponse) ?? []
});

const WASTE_ISSUE_INCLUDE = {
    createdBy: { select: { id: true, name: true } },
    status: { select: { id: true, name: true } },
    fulfillmentStatus: { select: { id: true, name: true } },
    department: { select: { id: true, name: true } },
    requester: { select: { id: true, fullName: true } },
    client: { select: { id: true, name: true } },
    advisor: { select: { id: true, fullName: true } },
    details: {
        orderBy: { createdAt: 'asc' },
        include: {
            fulfillmentStatus: { select: { id: true, name: true } },
            waste: {
                include: {
                    supplier: true,
                    presentation: true,
                    unitMeasure: true
                }
            }
        }
    }
};

const WASTE_ISSUE_HEADER_ERROR_TYPES = {
    RequesterNotFound: WasteIssueRequesterNotFound,
    AdvisorNotFound: WasteIssueAdvisorNotFound,
    ClientAdvisorConflict: WasteIssueClientAdvisorConflict,
    ProjectNumberConflict: WasteIssueProjectNumberConflict
};

const resolveWasteIssueHeaderData = async ({ tx, dto }) => {

    const { requesterId, advisorId, departmentId, clientId, ...issueData } = dto;

    return resolveIssueHeaderData({
        tx,
        requesterId,
        advisorId,
        departmentId,
        clientId,
        issueData,
        statusName: GOODS_ISSUE_STATUS_NAMES.APPROVED,
        errorTypes: WASTE_ISSUE_HEADER_ERROR_TYPES
    });
};

const createWasteIssueDetailSnapshot = ({ waste, detail, fulfillmentStatusId }) => ({
    materialName: waste.name,
    quantity: detail.quantity,
    convertedQuantity: calculateConvertedQuantity({
        quantity: detail.quantity,
        base: waste.base,
        height: waste.height
    }),
    waste: {
        connect: { id: waste.id }
    },
    fulfillmentStatus: {
        connect: { id: fulfillmentStatusId }
    }
});

const buildWasteIssueDetails = async ({ tx, details, fulfillmentStatusId }) => {

    const uniqueIds = new Set(details.map(detail => detail.wasteId));

    if (uniqueIds.size !== details.length) {
        throw new WasteIssueStateConflict('No se puede repetir la misma merma en una salida.');
    }

    const wastes = await tx.waste.findMany({
        where: { id: { in: [...uniqueIds] }, isActive: true },
        include: {
            supplier: true,
            presentation: true,
            unitMeasure: true
        }
    });

    if (wastes.length !== uniqueIds.size) {
        throw new WasteIssueStateConflict('Una o más mermas no existen o están inactivas.');
    }

    const byId = new Map(wastes.map(waste => [waste.id, waste]));

    return details.map(detail => createWasteIssueDetailSnapshot({
        waste: byId.get(detail.wasteId),
        detail,
        fulfillmentStatusId
    }));
};

export const findAllWasteIssues = async ({
    skip = 0,
    take = 10,
    search = '',
    startDate = '',
    endDate = '',
    clientId = '',
    departmentId = '',
    personId = '',
    fulfillmentStatusId = '',
    observationsSearch = '',
    orderBy = 'requestDate',
    orderDir = 'desc'
}) => {

    const db = getDb();
    const sortableFields = new Set([
        'referenceNumber',
        'requestDate',
        'departmentName',
        'projectNumber',
        'clientName',
        'observations'
    ]);
    const where = {
        ...buildDateRangeFilter({ field: 'requestDate', startDate, endDate }),
        ...(clientId && { clientId }),
        ...(departmentId && { departmentId }),
        ...(personId && { requesterId: personId }),
        ...(fulfillmentStatusId && { fulfillmentStatusId }),
        ...(observationsSearch && {
            observations: { contains: observationsSearch, mode: 'insensitive' }
        }),
        ...(search && {
            OR: [
                { referenceNumber: { contains: search, mode: 'insensitive' } },
                { details: { some: { materialName: { contains: search, mode: 'insensitive' } } } }
            ]
        })
    };

    const [data, recordsTotal, recordsFiltered] = await Promise.all([
        db.wasteIssue.findMany({
            skip,
            take,
            where,
            include: WASTE_ISSUE_INCLUDE,
            orderBy: { [sortableFields.has(orderBy) ? orderBy : 'requestDate']: orderDir }
        }),
        db.wasteIssue.count(),
        db.wasteIssue.count({ where })
    ]);

    return {
        data: data.map(normalizeWasteIssueResponse),
        recordsTotal,
        recordsFiltered
    };
};

const createWasteIssueTransaction = async ({ wasteIssueDto, userId }) => getDb().$transaction(async tx => {

    const statusIds = await findWasteIssueFulfillmentStatusIds(tx);
    const pendingStatusId = statusIds.get(FULFILLMENT_STATUS_NAMES.PENDING);
    const { details: requestedDetails, ...headerDto } = wasteIssueDto;
    const details = await buildWasteIssueDetails({
        tx,
        details: requestedDetails,
        fulfillmentStatusId: pendingStatusId
    });
    const headerData = await resolveWasteIssueHeaderData({ tx, dto: headerDto });
    const referenceNumber = await generateYearlyReferenceNumber({ type: DOCUMENT_REFERENCE_TYPES.WASTE_ISSUE, tx });

    const issue = await tx.wasteIssue.create({
        data: {
            ...headerData,
            referenceNumber,
            createdBy: { connect: { id: userId } },
            fulfillmentStatus: { connect: { id: pendingStatusId } },
            details: { create: details }
        },
        include: WASTE_ISSUE_INCLUDE
    });

    return normalizeWasteIssueResponse(issue);
});

export const createWasteIssue = async ({ wasteIssueDto, userId }) => executeServiceOperation({
    logger: serviceLogger,
    operation: 'warehouse.wasteIssues.wasteIssueService.createWasteIssue',
    model: 'wasteIssue',
    data: wasteIssueDto,
    fallbackError: new WasteIssueCreateDatabaseError(),
    action: () => createWasteIssueTransaction({ wasteIssueDto, userId })
});

const updateWasteIssueTransaction = async ({ id, wasteIssueDto }) => getDb().$transaction(async tx => {

    const current = await tx.wasteIssue.findUnique({ where: { id }, include: { details: true } });

    if (!current) throw new WasteIssueNotFound();
    if (current.details.some(detail => Number(detail.suppliedQuantity) > 0)) {
        throw new WasteIssueAlreadySuppliedConflict();
    }

    const statusIds = await findWasteIssueFulfillmentStatusIds(tx);
    const pendingStatusId = statusIds.get(FULFILLMENT_STATUS_NAMES.PENDING);
    const { details: requestedDetails, ...headerDto } = wasteIssueDto;
    const details = await buildWasteIssueDetails({
        tx,
        details: requestedDetails,
        fulfillmentStatusId: pendingStatusId
    });
    const headerData = await resolveWasteIssueHeaderData({ tx, dto: headerDto });
    await tx.wasteIssueDetail.deleteMany({ where: { wasteIssueId: id } });

    const issue = await tx.wasteIssue.update({
        where: { id },
        data: {
            ...headerData,
            fulfillmentStatus: { connect: { id: pendingStatusId } },
            details: { create: details }
        },
        include: WASTE_ISSUE_INCLUDE
    });

    return normalizeWasteIssueResponse(issue);
});

export const updateWasteIssue = async ({ id, wasteIssueDto }) => executeServiceOperation({
    logger: serviceLogger,
    operation: 'warehouse.wasteIssues.wasteIssueService.updateWasteIssue',
    model: 'wasteIssue',
    data: { id, ...wasteIssueDto },
    fallbackError: new WasteIssueUpdateDatabaseError(),
    action: () => updateWasteIssueTransaction({ id, wasteIssueDto })
});

export const updateWasteIssueHeader = async ({ id, wasteIssueDto }) => {
    return executeServiceOperation({
        logger: serviceLogger,
        operation: 'warehouse.wasteIssues.wasteIssueService.updateWasteIssueHeader',
        model: 'wasteIssue',
        data: { id, ...wasteIssueDto },
        fallbackError: new WasteIssueUpdateDatabaseError(),
        action: async () => {
            const headerData = await resolveWasteIssueHeaderData({ dto: wasteIssueDto });

            try {
                const issue = await getDb().wasteIssue.update({
                    where: { id },
                    data: headerData,
                    include: WASTE_ISSUE_INCLUDE
                });

                return normalizeWasteIssueResponse(issue);
            } catch (error) {
                if (error?.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
                    throw new WasteIssueNotFound();
                }

                throw error;
            }
        }
    });
};

const updateWasteIssueDetailsTransaction = async ({ id, wasteIssueDto }) => getDb().$transaction(async tx => {

    const issue = await tx.wasteIssue.findUnique({
        where: { id },
        include: { details: true, fulfillmentStatus: { select: { name: true } } }
    });

    if (!issue) throw new WasteIssueNotFound();
    if ([
        FULFILLMENT_STATUS_NAMES.COMPLETE,
        FULFILLMENT_STATUS_NAMES.CANCELED
    ].includes(issue.fulfillmentStatus?.name)) {
        throw new WasteIssueStateConflict('La salida ya no tiene detalles pendientes por surtir.');
    }

    const statusIds = await findWasteIssueFulfillmentStatusIds(tx);

    const requested = new Map(wasteIssueDto.details.map(detail => [detail.id, detail]));
    const hasInvalidDetail = wasteIssueDto.details.some(
        detail => !issue.details.some(current => current.id === detail.id)
    );

    if (requested.size !== wasteIssueDto.details.length || hasInvalidDetail) {
        throw new WasteIssueDetailNotFound();
    }

    const supplyDetails = [];

    for (const detail of issue.details) {

        if (!requested.has(detail.id)) continue;

        const current = Number(detail.suppliedQuantity);
        const maximum = Number(detail.quantity);
        const projectConvertedQuantity = requested.get(detail.id).projectConvertedQuantity;
        const convertedQuantityDifference = Number(detail.convertedQuantity) - projectConvertedQuantity;

        if (!requested.get(detail.id).isSupplied || detail.isSupplied) continue;

        const delta = maximum - current;

        const detailStatusName = resolveIssueDetailFulfillmentStatus({
            quantity: maximum,
            suppliedQuantity: maximum
        });
        await tx.wasteIssueDetail.update({
            where: { id: detail.id },
            data: {
                suppliedQuantity: maximum,
                isSupplied: true,
                projectConvertedQuantity,
                convertedQuantityDifference,
                fulfillmentStatus: { connect: { id: statusIds.get(detailStatusName) } }
            }
        });
        supplyDetails.push({
            wasteId: detail.wasteId,
            wasteIssueDetailId: detail.id,
            materialName: detail.materialName,
            quantity: delta,
            convertedQuantity: Number(detail.convertedQuantity) * delta / maximum
        });
    }

    await applyWasteIssueMovement({
        tx,
        wasteIssueId: issue.id,
        details: supplyDetails
    });

    const details = await tx.wasteIssueDetail.findMany({ where: { wasteIssueId: id } });
    const statusName = resolveIssueFulfillmentStatus(details);

    const updatedIssue = await tx.wasteIssue.update({
        where: { id },
        data: { fulfillmentStatus: { connect: { id: statusIds.get(statusName) } } },
        include: WASTE_ISSUE_INCLUDE
    });

    return normalizeWasteIssueResponse(updatedIssue);
});

export const updateWasteIssueDetails = async ({ id, wasteIssueDto }) => executeServiceOperation({
    logger: serviceLogger,
    operation: 'warehouse.wasteIssues.wasteIssueService.updateWasteIssueDetails',
    model: 'wasteIssue',
    data: { id, ...wasteIssueDto },
    fallbackError: new WasteIssueUpdateDatabaseError(),
    action: () => updateWasteIssueDetailsTransaction({ id, wasteIssueDto })
});
