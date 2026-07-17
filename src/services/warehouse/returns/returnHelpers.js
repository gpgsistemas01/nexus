import { GoodsIssueDetailNotFound, GoodsIssueNotFound, GoodsIssueSuppliedConflict, GoodsIssueUpdateDatabaseError } from '../../../errors/warehouse/goodsIssueError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';
import { createGoodsIssueReturnStockAdjustment } from '../adjustmentService.js';
import { INVENTORY_MOVEMENT_TYPES } from '../../../constants/inventory.js';

export const findReturnedQuantityTotalsByDetailIds = async ({
    tx = null,
    detailIds = [],
    detailField,
    normalizeTotal = (value) => value
}) => {
    const db = getDb(tx);

    if (!detailIds.length) return new Map();

    const returnedTotals = await db.movementDetail.groupBy({
        by: [detailField],
        where: {
            [detailField]: { in: detailIds },
            movement: { type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT }
        },
        _sum: { quantity: true }
    });

    return new Map(
        returnedTotals.map(row => [row[detailField], normalizeTotal(normalizeDecimal(row._sum.quantity ?? 0))])
    );
};

export const RETURN_DOCUMENT_CONFIGS = Object.freeze({
    goodsIssue: {
        modelName: 'goodsIssue',
        resultKey: 'goodsIssueId',
        logModel: 'goodsIssueReturn',
        operation: 'warehouse.returns.returnService.returnGoodsIssueProducts',
        documentSelect: {},
        detailSelect: {
            id: true,
            productId: true,
            supplierId: true,
            suppliedQuantity: true
        },
        quantityField: 'suppliedQuantity',
        detailReturnField: 'goodsIssueDetailId',
        getSupplierId: ({ detail }) => detail.supplierId,
        createAdjustment: createGoodsIssueReturnStockAdjustment,
        buildDocumentLink: ({ document, detail }) => ({
            goodsIssueId: document.id,
            goodsIssueDetailId: detail.id
        }),
        NotFoundError: GoodsIssueNotFound,
        InvalidQuantityError: GoodsIssueSuppliedConflict,
        DetailNotFoundError: GoodsIssueDetailNotFound,
        UpdateError: GoodsIssueUpdateDatabaseError
    }
});
