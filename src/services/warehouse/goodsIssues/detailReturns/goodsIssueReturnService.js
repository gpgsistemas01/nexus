import {
    GoodsIssueDetailNotFound,
    GoodsIssueReturnDatabaseError,
    GoodsIssueReturnQuantityConflict,
    GoodsIssueReturnStatusConflict
} from '../../../../errors/warehouse/goodsIssueError.js';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../../constants/warehouseStatuses.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../../constants/inventory.js';
import { getDb } from '../../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../../utils/formattersUtils.js';
import { createServiceLogger } from '../../../../utils/logger.js';
import { handleServiceError } from '../../../serviceErrorHandler.js';
import { applyInventoryMovement } from '../../../inventory/movementService.js';
import { findFulfillmentStatusIdsByName } from '../../fulfillmentStatusService.js';
import { resolveIssueFulfillmentStatus } from '../../issues/issueFulfillmentRules.js';
import { GOODS_ISSUE_DETAIL_SELECT } from '../goodsIssueDetailSelect.js';
import { resolveGoodsIssueDetailFulfillmentStatusName } from '../goodsIssueFulfillmentRules.js';

const FLOAT_EPSILON = 0.000001;
const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueReturnService');

export const returnGoodsIssueDetail = async ({ id, detailId, returnDto, userId }) => {
    const { returnQuantity: requestedReturnQuantityInput, observations = null } = returnDto;

    try {
        return await getDb().$transaction(async tx => {
            const statusIdsByName = await findFulfillmentStatusIdsByName({
                tx,
                names: Object.values(FULFILLMENT_STATUS_NAMES)
            });
            const detail = await tx.goodsIssueDetail.findFirst({
                where: { id: detailId, goodsIssueId: id },
                include: { goodsIssue: { include: { fulfillmentStatus: true } } }
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
                requestedReturnQuantity <= FLOAT_EPSILON
                || requestedReturnQuantity > availableReturnQuantity
                || newTotalReturnedQuantity > totalSuppliedQuantity
            ) {
                throw new GoodsIssueReturnQuantityConflict();
            }

            const movement = await applyInventoryMovement({
                tx,
                reference: { goodsIssueId: id },
                details: [{
                    materialId: detail.materialId,
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
                    fulfillmentStatusId: statusIdsByName.get(resolveGoodsIssueDetailFulfillmentStatusName({
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
            const allDetailsCanceled = refreshedDetails.length > 0
                && refreshedDetails.every(current => current.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED);
            const fulfillmentName = allDetailsCanceled
                ? FULFILLMENT_STATUS_NAMES.CANCELED
                : resolveIssueFulfillmentStatus(refreshedDetails);

            await tx.goodsIssue.update({
                where: { id },
                data: {
                    fulfillmentStatus: { connect: { name: fulfillmentName } },
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
                    materialId: detail.materialId,
                    materialName: detail.materialName,
                    supplierId: detail.supplierId,
                    currentTotalReturnedQuantity,
                    newTotalReturnedQuantity,
                    observations
                },
                include: { movementDetail: true, returnedBy: true }
            });

            return { ...goodsIssueReturn, detail: updatedDetail };
        });
    } catch (error) {
        handleServiceError({
            logger: serviceLogger,
            error,
            operation: 'warehouse.goodsIssues.goodsIssueReturnService.returnGoodsIssueDetail',
            model: 'goodsIssueReturn',
            data: { id, detailId, ...returnDto },
            fallbackError: new GoodsIssueReturnDatabaseError()
        });
    }
};
