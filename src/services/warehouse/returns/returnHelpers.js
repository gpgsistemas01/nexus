import { GoodsIssueInsufficientStock } from '../../../errors/inventory/stockError.js';
import { GoodsIssueNotFound, GoodsIssueSuppliedConflict, GoodsIssueUpdateDatabaseError } from '../../../errors/warehouse/goodsIssueError.js';
import {
    GoodsReceiptNotFound,
    GoodsReceiptReturnConflict,
    GoodsReceiptReturnInsufficientStock,
    GoodsReceiptReturnQuantityExceeded,
    GoodsReceiptUpdateDatabaseError
} from '../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../repository/baseRepository.js';
import { normalizeDecimal } from '../../../utils/formattersUtils.js';
import { createGoodsIssueReturnStockAdjustment, createGoodsReceiptReturnStockAdjustment } from '../adjustmentService.js';

const MOVEMENT_TYPE_ADJUSTMENT = 'ADJUSTMENT';

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
            movement: { type: MOVEMENT_TYPE_ADJUSTMENT }
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
        UpdateError: GoodsIssueUpdateDatabaseError
    },
    goodsReceipt: {
        modelName: 'goodsReceipt',
        resultKey: 'goodsReceiptId',
        logModel: 'goodsReceiptReturn',
        operation: 'warehouse.returns.returnService.returnGoodsReceiptProducts',
        documentSelect: {
            supplierId: true
        },
        detailSelect: {
            id: true,
            productId: true,
            quantity: true
        },
        quantityField: 'quantity',
        detailReturnField: 'goodsReceiptDetailId',
        normalizeReturnedTotal: Math.abs,
        getSupplierId: ({ document }) => document.supplierId,
        createAdjustment: createGoodsReceiptReturnStockAdjustment,
        buildDocumentLink: ({ document, detail }) => ({
            goodsReceiptId: document.id,
            goodsReceiptDetailId: detail.id
        }),
        NotFoundError: GoodsReceiptNotFound,
        InvalidQuantityError: GoodsReceiptReturnConflict,
        QuantityExceededError: GoodsReceiptReturnQuantityExceeded,
        mapError: (err) => {
            if (err instanceof GoodsIssueInsufficientStock) {
                return new GoodsReceiptReturnInsufficientStock(err.meta);
            }

            return err;
        },
        UpdateError: GoodsReceiptUpdateDatabaseError
    }
});
