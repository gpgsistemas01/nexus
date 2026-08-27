import { formatDateLongWithTime, toNumber } from "../../utils/formattersUtils.js";
import { findAllMaterialMovements, findAllWasteMovements } from "./movementQueryService.js";

const MOVEMENT_REPORT_QUERIES = Object.freeze({
    materials: findAllMaterialMovements,
    wastes: findAllWasteMovements
});

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
    context = 'materials',
    startDate = '',
    endDate = '',
    search = '',
    movementType = '',
    materialId = '',
    wasteId = '',
    supplierId = '',
    goodsIssueId = '',
    goodsReceiptId = '',
    stockAdjustmentId = '',
    orderBy = 'date',
    orderDir = 'desc'
} = {}) => {
    const findMovements = MOVEMENT_REPORT_QUERIES[context];
    if (!findMovements) return [];

    const movementsResult = await findMovements({
        skip: 0,
        take: 100000,
        startDate,
        endDate,
        movementType,
        search,
        materialId,
        wasteId,
        supplierId,
        goodsIssueId,
        goodsReceiptId,
        stockAdjustmentId,
        orderBy,
        orderDir,
    });

    return mapMovementReportRows(movementsResult.data);
};
