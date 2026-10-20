import { findPage } from '../../../repository/paginationRepository.js';
import { DOCUMENT_REFERENCE_TYPES } from '../../../constants/documentReferenceTypes.js';
import { PRISMA_ERROR_CODES } from '../../../constants/prisma.js';
import { FULFILLMENT_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import {
    WasteIssueAlreadySuppliedConflict,
    WasteIssueNotFound,
    WasteIssueCreateDatabaseError,
    WasteIssueUpdateDatabaseError,
} from '../../../errors/warehouse/wasteIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { lockWasteIssue } from '../../../repository/warehouse/documentLockRepository.js';
import {
    buildWasteIssueDetails,
    normalizeWasteIssueResponse,
    resolveWasteIssueHeaderData,
    WASTE_ISSUE_INCLUDE
} from './wasteIssueHelpers.js';
import { generateYearlyReferenceNumber } from '../../document/referenceNumberService.js';
import { createServiceLogger } from '../../../utils/logger.js';
import { executeServiceOperation } from '../../serviceErrorHandler.js';
import { findWasteIssueFulfillmentStatusIds } from './wasteIssueFulfillmentService.js';
import { buildDateRangeFilter } from '../../../utils/requestQueryUtils.js';

const serviceLogger = createServiceLogger('warehouse.wasteIssues.wasteIssueService');

export const findAllWasteIssues = async ({
    cursor,
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
    includeCounts = true,
    includeDetails = true,
    id = null,
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
        ...(id && { id }),
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

    const page = await findPage({
        model: db.wasteIssue,
        hasFilters: Object.keys(where).length > 0,
        includeCounts,
        query: {
            skip,
            take,
            ...(cursor && { cursor }),
            where,
            include: { ...WASTE_ISSUE_INCLUDE, details: includeDetails ? WASTE_ISSUE_INCLUDE.details : false },
            orderBy: [{ [sortableFields.has(orderBy) ? orderBy : 'requestDate']: orderDir }, { id: 'asc' }]
        }
    });

    return { ...page, data: page.data.map(normalizeWasteIssueResponse) };
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
    await lockWasteIssue({ tx, id });

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
        action: () => getDb().$transaction(async tx => {
            await lockWasteIssue({ tx, id });
            const headerData = await resolveWasteIssueHeaderData({ tx, dto: wasteIssueDto });

            try {
                const issue = await tx.wasteIssue.update({
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
        })
    });
};
