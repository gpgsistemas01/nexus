import {
    WasteIssueAdvisorNotFound,
    WasteIssueClientAdvisorConflict,
    WasteIssueDuplicateWasteConflict,
    WasteIssueProjectNumberConflict,
    WasteIssueRequesterNotFound,
    WasteIssueWasteUnavailableConflict
} from '../../../errors/warehouse/wasteIssueError.js';
import { GOODS_ISSUE_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import { resolveIssueHeaderData } from '../issues/issueHeaderService.js';
import { calculateConvertedQuantity } from '../../inventory/stockHelpers.js';

const normalizeWasteIssueDetailResponse = detail => ({
    ...detail,
    maxUnitCost: detail.maxUnitCost ?? detail.waste?.maxUnitCost ?? null,
    projectConvertedQuantity: detail.projectConvertedQuantity ?? null,
    convertedQuantityDifference: detail.convertedQuantityDifference ?? null
});

export const normalizeWasteIssueResponse = issue => issue && ({
    ...issue,
    details: issue.details?.map(normalizeWasteIssueDetailResponse) ?? []
});

export const WASTE_ISSUE_INCLUDE = {
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

export const resolveWasteIssueHeaderData = async ({ tx, dto }) => {

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

export const buildWasteIssueDetails = async ({ tx, details, fulfillmentStatusId }) => {

    const uniqueIds = new Set(details.map(detail => detail.wasteId));

    if (uniqueIds.size !== details.length) {
        throw new WasteIssueDuplicateWasteConflict();
    }

    const wastes = await tx.waste.findMany({
        where: { id: { in: [...uniqueIds] }, isActive: true },
        select: { id: true, name: true, base: true, height: true }
    });

    if (wastes.length !== uniqueIds.size) {
        throw new WasteIssueWasteUnavailableConflict();
    }

    const byId = new Map(wastes.map(waste => [waste.id, waste]));

    return details.map(detail => createWasteIssueDetailSnapshot({
        waste: byId.get(detail.wasteId),
        detail,
        fulfillmentStatusId
    }));
};
