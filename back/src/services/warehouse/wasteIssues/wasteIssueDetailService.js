import { FULFILLMENT_STATUS_NAMES } from '../../../shared/constants/fulfillmentStatuses.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import {
    WasteIssueDetailNotFound,
    WasteIssueMissingMaxUnitCost,
    WasteIssueNotFound,
    WasteIssueStateConflict,
    WasteIssueUpdateDatabaseError
} from '../../../errors/warehouse/wasteIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { lockWasteIssue } from '../../../repository/warehouse/documentLockRepository.js';
import { updateWasteIssueDetails as persistWasteIssueDetails } from '../../../repository/warehouse/issueDetailRepository.js';
import { createServiceLogger } from '../../../utils/logger.js';
import { executeServiceOperation } from '../../serviceErrorHandler.js';
import { applyWasteMovement } from '../wastes/wasteMovementService.js';
import { resolveIssueSupplyChange } from '../issues/issueSupplyRules.js';
import {
    resolveIssueDetailFulfillmentStatus,
    resolveIssueFulfillmentStatus
} from '../issues/issueFulfillmentRules.js';
import { findWasteIssueFulfillmentStatusIds } from './wasteIssueFulfillmentService.js';
import { normalizeWasteIssueResponse, WASTE_ISSUE_INCLUDE } from './wasteIssueHelpers.js';

const serviceLogger = createServiceLogger('warehouse.wasteIssues.wasteIssueDetailService');

const updateWasteIssueDetailsTransaction = async ({ id, wasteIssueDto }) => getDb().$transaction(async tx => {
    await lockWasteIssue({ tx, id });

    const issue = await tx.wasteIssue.findUnique({
        where: { id },
        select: {
            id: true,
            fulfillmentStatus: { select: { name: true } },
            details: {
                select: {
                    id: true,
                    wasteId: true,
                    materialName: true,
                    waste: { select: { maxUnitCost: true, presentation: { select: { name: true } } } },
                    quantity: true,
                    convertedQuantity: true,
                    suppliedQuantity: true,
                    isSupplied: true,
                    fulfillmentStatusId: true
                }
            }
        }
    });

    if (!issue) throw new WasteIssueNotFound();
    if ([FULFILLMENT_STATUS_NAMES.COMPLETE, FULFILLMENT_STATUS_NAMES.CANCELED].includes(issue.fulfillmentStatus?.name)) {
        throw new WasteIssueStateConflict();
    }

    const statusIds = await findWasteIssueFulfillmentStatusIds(tx);
    const currentById = new Map(issue.details.map(detail => [detail.id, detail]));
    const updates = [];
    const supplyDetails = [];

    for (const requested of wasteIssueDto.details) {
        const detail = currentById.get(requested.id);
        if (!detail) throw new WasteIssueDetailNotFound();

        currentById.delete(requested.id);
        if (requested.quantityToSupply === undefined && (!requested.isSupplied || detail.isSupplied)) continue;

        const change = resolveIssueSupplyChange({ current: detail, requested });
        if (!change) continue;

        if (change.quantityToSupply > 0 && !(Number(detail.waste.maxUnitCost) > 0)) {
            throw new WasteIssueMissingMaxUnitCost({ materialName: detail.materialName });
        }

        Object.assign(detail, change.data);
        detail.fulfillmentStatusId = statusIds.get(resolveIssueDetailFulfillmentStatus(detail));
        updates.push(detail);
        supplyDetails.push({
            wasteId: detail.wasteId,
            wasteIssueDetailId: detail.id,
            materialName: detail.materialName,
            quantity: change.quantityToSupply,
            convertedQuantity: Number(detail.convertedQuantity) * change.quantityToSupply / Number(detail.quantity)
        });
    }

    const updatedCount = await persistWasteIssueDetails({ tx, id, details: updates });
    if (updatedCount !== updates.length) throw new WasteIssueDetailNotFound();

    await applyWasteMovement({
        tx,
        reference: { wasteIssueId: id },
        details: supplyDetails,
        movementType: INVENTORY_MOVEMENT_TYPES.ISSUE
    });

    const updatedIssue = await tx.wasteIssue.update({
        where: { id },
        data: { fulfillmentStatusId: statusIds.get(resolveIssueFulfillmentStatus(issue.details)) },
        include: WASTE_ISSUE_INCLUDE
    });

    return normalizeWasteIssueResponse(updatedIssue);
});

export const updateWasteIssueDetails = ({ id, wasteIssueDto }) => executeServiceOperation({
    logger: serviceLogger,
    operation: 'warehouse.wasteIssues.wasteIssueDetailService.updateWasteIssueDetails',
    model: 'wasteIssue',
    data: { id, ...wasteIssueDto },
    fallbackError: new WasteIssueUpdateDatabaseError(),
    action: () => updateWasteIssueDetailsTransaction({ id, wasteIssueDto })
});
