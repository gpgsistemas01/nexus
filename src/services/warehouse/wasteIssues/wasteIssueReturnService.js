import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import {
    WasteIssueDetailNotFound,
    WasteIssueReturnDatabaseError,
    WasteIssueReturnQuantityConflict,
    WasteIssueReturnStatusConflict
} from '../../../errors/warehouse/wasteIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';
import { createServiceLogger } from '../../../utils/logger.js';
import { executeServiceOperation } from '../../serviceErrorHandler.js';
import { calculateProportionalConvertedQuantity } from '../../inventory/stockHelpers.js';
import { applyWasteIssueReturnMovement } from '../wastes/wasteMovementService.js';
import { findWasteIssueFulfillmentStatusIds } from './wasteIssueFulfillmentService.js';

const serviceLogger = createServiceLogger('warehouse.wasteIssues.wasteIssueReturnService');

const returnWasteIssueDetailTransaction = ({ id, detailId, returnDto, userId }) => getDb().$transaction(async tx => {
    const detail = await tx.wasteIssueDetail.findFirst({
        where: { id: detailId, wasteIssueId: id },
        include: { wasteIssue: { include: { fulfillmentStatus: true } } }
    });

    if (!detail) throw new WasteIssueDetailNotFound();
    if (detail.wasteIssue.fulfillmentStatus.name !== FULFILLMENT_STATUS_NAMES.COMPLETE) {
        throw new WasteIssueReturnStatusConflict();
    }

    const returnedQuantity = normalizeDecimal(detail.returnedQuantity);
    const suppliedQuantity = normalizeDecimal(detail.suppliedQuantity);
    const returnQuantity = normalizeDecimal(returnDto.returnQuantity);
    const availableQuantity = normalizeDecimal(suppliedQuantity - returnedQuantity);

    if (returnQuantity <= 0 || returnQuantity > availableQuantity) {
        throw new WasteIssueReturnQuantityConflict();
    }

    const newTotalReturnedQuantity = normalizeDecimal(returnedQuantity + returnQuantity);
    const movement = await applyWasteIssueReturnMovement({
        tx,
        wasteIssueId: id,
        detail: {
            wasteId: detail.wasteId,
            wasteIssueDetailId: detail.id,
            quantity: returnQuantity,
            convertedQuantity: calculateProportionalConvertedQuantity({
                convertedQuantity: detail.convertedQuantity,
                partialQuantity: returnQuantity,
                totalQuantity: detail.quantity
            })
        }
    });
    const statusIds = await findWasteIssueFulfillmentStatusIds(tx);
    const isCanceled = newTotalReturnedQuantity >= suppliedQuantity;
    const updatedDetail = await tx.wasteIssueDetail.update({
        where: { id: detail.id },
        data: {
            returnedQuantity: newTotalReturnedQuantity,
            fulfillmentStatusId: statusIds.get(
                isCanceled ? FULFILLMENT_STATUS_NAMES.CANCELED : FULFILLMENT_STATUS_NAMES.COMPLETE
            )
        },
        include: { fulfillmentStatus: true }
    });
    const details = await tx.wasteIssueDetail.findMany({
        where: { wasteIssueId: id },
        include: { fulfillmentStatus: true }
    });
    const allCanceled = details.every(current => (
        current.fulfillmentStatus.name === FULFILLMENT_STATUS_NAMES.CANCELED
    ));

    if (allCanceled) {
        await tx.wasteIssue.update({
            where: { id },
            data: {
                fulfillmentStatus: {
                    connect: { id: statusIds.get(FULFILLMENT_STATUS_NAMES.CANCELED) }
                },
                status: { connect: { name: GOODS_ISSUE_STATUS_NAMES.CANCELED } }
            }
        });
    }

    const wasteIssueReturn = await tx.wasteIssueReturn.create({
        data: {
            wasteIssueId: id,
            wasteIssueDetailId: detail.id,
            movementDetailId: movement.details[0]?.id,
            returnedById: userId,
            wasteId: detail.wasteId,
            materialName: detail.materialName,
            currentTotalReturnedQuantity: returnedQuantity,
            newTotalReturnedQuantity,
            observations: returnDto.observations ?? null
        }
    });

    return { ...wasteIssueReturn, detail: updatedDetail };
});

export const returnWasteIssueDetail = ({ id, detailId, returnDto, userId }) => executeServiceOperation({
    logger: serviceLogger,
    operation: 'warehouse.wasteIssues.wasteIssueReturnService.returnWasteIssueDetail',
    model: 'wasteIssueReturn',
    data: { id, detailId, ...returnDto },
    fallbackError: new WasteIssueReturnDatabaseError(),
    action: () => returnWasteIssueDetailTransaction({ id, detailId, returnDto, userId })
});
