import { formatDateLongWithTime, toNumber } from "../../utils/formattersUtils.js";
import { findAllMovements } from "./movementQueryService.js";

export const findMovementReportRows = async ({
    startDate = '',
    endDate = '',
    search = '',
    movementType = '',
    materialId = '',
    supplierId = '',
    goodsIssueId = '',
    goodsReceiptId = '',
    stockAdjustmentId = '',
    orderBy = 'date',
    orderDir = 'desc'
} = {}) => {

    const movementsResult = await findAllMovements({
        skip: 0,
        take: 100000,
        startDate,
        endDate,
        movementType,
        search,
        materialId,
        supplierId,
        goodsIssueId,
        goodsReceiptId,
        stockAdjustmentId,
        orderBy,
        orderDir,
    });

    return movementsResult.data.map((movement) => ({
        ...movement,
        date: formatDateLongWithTime(movement.date),
        createdAt: formatDateLongWithTime(movement.createdAt),
        previousStock: toNumber(movement.previousStock),
        quantity: toNumber(movement.quantity),
        newStock: toNumber(movement.newStock),
        materialBase: toNumber(movement.materialBase),
        materialHeight: toNumber(movement.materialHeight),
    }));
};
