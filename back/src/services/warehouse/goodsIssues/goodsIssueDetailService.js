import {
    GoodsIssueDetailNotFound,
    GoodsIssueNotFound,
    GoodsIssueNotPendingConflict,
    GoodsIssueUpdateDatabaseError
} from '../../../errors/warehouse/goodsIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { GoodsIssueMissingMaxUnitCost } from '../../../errors/inventory/stockError.js';
import { lockGoodsIssue } from '../../../repository/warehouse/documentLockRepository.js';
import { updateGoodsIssueDetails as persistGoodsIssueDetails } from '../../../repository/warehouse/issueDetailRepository.js';
import { createServiceLogger } from '../../../utils/logger.js';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../shared/constants/fulfillmentStatuses.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { executeServiceOperation } from '../../serviceErrorHandler.js';
import { applyInventoryMovement } from '../../inventory/movementService.js';
import { findFulfillmentStatusIdsByName } from '../fulfillmentStatusService.js';
import { resolveIssueFulfillmentStatus } from '../issues/issueFulfillmentRules.js';
import { resolveIssueSupplyChange } from '../issues/issueSupplyRules.js';
import { buildGoodsIssueContextWhere } from './goodsIssueHelpers.js';
import { GOODS_ISSUE_DETAIL_SELECT } from './goodsIssueDetailSelect.js';
import { resolveGoodsIssueDetailFulfillmentStatusName } from './goodsIssueFulfillmentRules.js';

const serviceLogger = createServiceLogger('warehouse.goodsIssues.goodsIssueDetailService');

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
                    material: { select: { presentation: { select: { name: true } } } },
                    supplierId: true,
                    materialName: true,
                    maxUnitCost: true,
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
        const change = resolveIssueSupplyChange({ current, requested: detail });
        if (!change) continue;

        const { data, quantityToSupply } = change;
        if (quantityToSupply > 0) {
            if (!(Number(current.maxUnitCost) > 0)) {
                throw new GoodsIssueMissingMaxUnitCost({ materialName: current.materialName });
            }
            data.fulfillmentStatusId = statusIds.get(resolveGoodsIssueDetailFulfillmentStatusName({ ...current, ...data }));
            movements.push({
                materialId: current.materialId,
                supplierId: current.supplierId,
                goodsIssueDetailId: current.id,
                quantity: quantityToSupply
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
