import { toNumber } from "../../utils/formattersUtils.js";
import { findAllMaterialMovements, findAllConsumableMovements, findAllWasteMovements } from "./movementQueryService.js";

const MOVEMENT_REPORT_QUERIES = Object.freeze({
    materials: findAllMaterialMovements,
    consumables: findAllConsumableMovements,
    wastes: findAllWasteMovements
});

const mapMovementReportRows = (movements) => movements.map((movement) => ({
    ...movement,
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
        includeCounts: false,
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
