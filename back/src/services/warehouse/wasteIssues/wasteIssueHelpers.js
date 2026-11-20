import {
    WasteIssueAdvisorNotFound,
    WasteIssueClientAdvisorConflict,
    WasteIssueDuplicateWasteConflict,
    WasteIssueMissingMaxUnitCost,
    WasteIssueProjectNumberConflict,
    WasteIssueRequesterNotFound,
    WasteIssueWasteUnavailableConflict
} from '../../../errors/warehouse/wasteIssueError.js';
import { GOODS_ISSUE_STATUS_NAMES } from '../../../shared/constants/fulfillmentStatuses.js';
import { HISTORICAL_DELIVERY_SELECT } from '../issues/historicalDeliverySelect.js';
import { resolveIssueHeaderData } from '../issues/issueHeaderService.js';
import { calculateConvertedQuantity } from '../../../shared/inventory/stockQuantity.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';

const normalizeWasteIssueDetailResponse = (detail, historical = false) => ({
    ...detail,
    maxUnitCost: historical ? null : detail.maxUnitCost ?? detail.waste?.maxUnitCost ?? null,
    projectConvertedQuantity: detail.projectConvertedQuantity ?? null,
    convertedQuantityDifference: detail.convertedQuantityDifference ?? null
});

export const normalizeWasteIssueResponse = issue => issue && ({
    ...issue,
    ...(issue.details && { details: issue.details.map(detail => normalizeWasteIssueDetailResponse(detail, !!issue.historicalDeliveryBatchId)) })
});

export const WASTE_ISSUE_INCLUDE = {
    historicalDeliveryBatch: { select: HISTORICAL_DELIVERY_SELECT },
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

const createWasteIssueDetailSnapshot = ({ waste, detail, fulfillmentStatusId, previous }) => {
    assertPieceQuantity({ quantity: detail.quantity, item: waste });

    return {
        materialName: previous?.materialName ?? waste.name,
        supplierName: previous?.supplierName || waste.supplier.tradeName,
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
    };
};

export const buildWasteIssueDetails = async ({ tx, details, fulfillmentStatusId, previousDetails = [] }) => {

    const uniqueIds = new Set(details.map(detail => detail.wasteId));

    if (uniqueIds.size !== details.length) {
        throw new WasteIssueDuplicateWasteConflict();
    }

    const wastes = await tx.waste.findMany({
        where: { id: { in: [...uniqueIds] }, isActive: true },
        select: {
            id: true, name: true, base: true, height: true, maxUnitCost: true,
            presentation: { select: { name: true } },
            supplier: { select: { tradeName: true } }
        }
    });

    if (wastes.length !== uniqueIds.size) {
        throw new WasteIssueWasteUnavailableConflict();
    }

    const byId = new Map(wastes.map(waste => [waste.id, waste]));
    const previousById = new Map(previousDetails.map(detail => [detail.wasteId, detail]));

    for (const waste of wastes) {
        if (!(Number(waste.maxUnitCost) > 0)) {
            throw new WasteIssueMissingMaxUnitCost({ materialName: waste.name });
        }
    }

    return details.map(detail => createWasteIssueDetailSnapshot({
        waste: byId.get(detail.wasteId),
        detail,
        previous: previousById.get(detail.wasteId),
        fulfillmentStatusId
    }));
};
