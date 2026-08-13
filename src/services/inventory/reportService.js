import { formatDateLongWithTime, toNumber } from "../../utils/formattersUtils.js";
import { findAllMaterialMovements, findAllWasteMovements } from "./movementQueryService.js";

const mapMovementReportRows = (movements) => movements.map((movement) => ({
    ...movement,
    date: formatDateLongWithTime(movement.date),
    createdAt: formatDateLongWithTime(movement.createdAt),
    previousStock: toNumber(movement.previousStock),
    quantity: toNumber(movement.quantity),
    newStock: toNumber(movement.newStock),
    materialBase: toNumber(movement.materialBase),
    materialHeight: toNumber(movement.materialHeight),
}));

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

    const movementsResult = await findAllMaterialMovements({
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

    return mapMovementReportRows(movementsResult.data);
};

export const findWasteMovementReportRows = async (params = {}) => {
    const movementsResult = await findAllWasteMovements({
        ...params,
        skip: 0,
        take: 100000
    });

    return mapMovementReportRows(movementsResult.data);
};
