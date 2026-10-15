import {
    GoodsIssueDetailNotFound,
    GoodsIssueNotFound,
    GoodsIssueNotPendingConflict,
    GoodsIssueUpdateDatabaseError
} from '../../../errors/warehouse/goodsIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { lockGoodsIssue } from '../../../repository/warehouse/documentLockRepository.js';
import { updateGoodsIssueDetails as persistGoodsIssueDetails } from '../../../repository/warehouse/issueDetailRepository.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';
import { createServiceLogger } from '../../../utils/logger.js';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import { INVENTORY_MOVEMENT_TYPES, MATERIAL_TYPES } from '../../../constants/inventory.js';
import { executeServiceOperation } from '../../serviceErrorHandler.js';
import { applyInventoryMovement } from '../../inventory/movementService.js';
import { findFulfillmentStatusIdsByName } from '../fulfillmentStatusService.js';
import { resolveIssueFulfillmentStatus } from '../issues/issueFulfillmentRules.js';
import { buildGoodsIssueContextWhere } from './goodsIssueHelpers.js';
import { GOODS_ISSUE_DETAIL_SELECT } from './goodsIssueDetailSelect.js';
import { resolveGoodsIssueDetailFulfillmentStatusName } from './goodsIssueFulfillmentRules.js';

const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueDetailService');
const FLOAT_EPSILON = 0.000001;

const supplyGoodsIssue = async ({ id, goodsIssueDto, type }) => getDb().$transaction(async tx => {
    await lockGoodsIssue({ tx, id });
    const issue = await tx.goodsIssue.findUnique({
        where: { id, ...buildGoodsIssueContextWhere(type) },
        select: {
            id: true,
            fulfillmentStatus: { select: { name: true } },
            details: {
                select: {
                    id: true,
                    materialId: true,
                    supplierId: true,
                    quantity: true,
                    convertedQuantity: true,
                    suppliedQuantity: true,
                    returnedQuantity: true,
                    isSupplied: true,
                    fulfillmentStatusId: true
                }
            }
        }
    });
    if (!issue) throw new GoodsIssueNotFound();
    if (![FULFILLMENT_STATUS_NAMES.PENDING, FULFILLMENT_STATUS_NAMES.PARTIAL].includes(issue.fulfillmentStatus.name)) {
        throw new GoodsIssueNotPendingConflict();
    }

    const requested = goodsIssueDto.details ?? [];
    const currentById = new Map(issue.details.map(detail => [detail.id, detail]));
    const statusIds = await findFulfillmentStatusIdsByName({
        tx,
        names: Object.values(FULFILLMENT_STATUS_NAMES)
    });
    const updates = [];
    const movements = [];

    for (const detail of requested) {
        const current = currentById.get(detail.id);
        if (!current) throw new GoodsIssueDetailNotFound();

        // Consumir el id valida pertenencia y duplicados en el mismo recorrido.
        currentById.delete(detail.id);
        const quantity = normalizeDecimal(current.quantity);
        const pending = normalizeDecimal(quantity - normalizeDecimal(current.suppliedQuantity));
        const data = {
            projectConvertedQuantity: detail.projectConvertedQuantity,
            convertedQuantityDifference: normalizeDecimal(Number(current.convertedQuantity) - detail.projectConvertedQuantity)
        };
        if (detail.isSupplied && pending > FLOAT_EPSILON) {
            data.suppliedQuantity = quantity;
            data.isSupplied = true;
            data.fulfillmentStatusId = statusIds.get(resolveGoodsIssueDetailFulfillmentStatusName({ ...current, ...data }));
            movements.push({
                materialId: current.materialId,
                supplierId: current.supplierId,
                goodsIssueDetailId: current.id,
                quantity: pending
            });
        }
        Object.assign(current, data);
        updates.push(current);
    }

    const updatedCount = await persistGoodsIssueDetails({ tx, id, details: updates });
    if (updatedCount !== updates.length) throw new GoodsIssueDetailNotFound();

    if (movements.length) {
        await applyInventoryMovement({
            tx,
            reference: { goodsIssueId: id },
            details: movements,
            movementType: INVENTORY_MOVEMENT_TYPES.ISSUE
        });
    }
    return tx.goodsIssue.update({
        where: { id },
        data: {
            fulfillmentStatus: { connect: { name: resolveIssueFulfillmentStatus(issue.details) } },
            status: { connect: { name: GOODS_ISSUE_STATUS_NAMES.APPROVED } }
        },
        select: {
            id: true,
            type: true,
            status: true,
            fulfillmentStatus: true,
            details: { select: GOODS_ISSUE_DETAIL_SELECT }
        }
    });
});

export const updateGoodsIssueDetails = ({ id, goodsIssueDto, type = MATERIAL_TYPES.MATERIAL }) => executeServiceOperation({
    logger: serviceLogger,
    operation: 'warehouse.goodsIssues.goodsIssueDetailService.updateGoodsIssueDetails',
    model: 'goodsIssue',
    data: { id, ...goodsIssueDto },
    fallbackError: new GoodsIssueUpdateDatabaseError(),
    action: () => supplyGoodsIssue({ id, goodsIssueDto, type })
});
