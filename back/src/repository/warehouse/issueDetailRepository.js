import { Prisma } from '../../../generated/prisma/client.ts';
import { INVENTORY_MOVEMENT_TYPES } from '../../constants/inventory.js';

// El índice por origen permite sumar sólo las asignaciones de los surtidos de esta partida.
const findAvailableIssueSources = ({ tx, issueDetailId, detail, movement, cost, allocation, issueColumn }) => tx.$queryRaw(Prisma.sql`
    SELECT source.id, movement.date, balance.quantity, cost."unitCost"
    FROM ${detail} AS source
    JOIN ${movement} AS movement ON movement.id = source."movementId"
    JOIN ${cost} AS cost ON cost."movementDetailId" = source.id
    CROSS JOIN LATERAL (
        SELECT -source.quantity - COALESCE(SUM(allocation.quantity), 0) AS quantity
        FROM ${allocation} AS allocation
        WHERE allocation."sourceMovementDetailId" = source.id
    ) AS balance
    WHERE source.${issueColumn} = ${issueDetailId}::uuid AND source.quantity < 0
        AND movement.type = ${INVENTORY_MOVEMENT_TYPES.ISSUE}::"InventoryMovementType"
        AND balance.quantity > 0
    ORDER BY movement.date ASC, source.id ASC
`);

export const findAvailableGoodsIssueSources = ({ tx, issueDetailId }) => findAvailableIssueSources({
    tx, issueDetailId,
    detail: Prisma.sql`"MovementDetail"`,
    movement: Prisma.sql`"InventoryMovement"`,
    cost: Prisma.sql`"MovementDetailCost"`,
    allocation: Prisma.sql`"MovementReturnAllocation"`,
    issueColumn: Prisma.sql`"goodsIssueDetailId"`
});

export const findAvailableWasteIssueSources = ({ tx, issueDetailId }) => findAvailableIssueSources({
    tx, issueDetailId,
    detail: Prisma.sql`"WasteMovementDetail"`,
    movement: Prisma.sql`"WasteMovement"`,
    cost: Prisma.sql`"WasteMovementDetailCost"`,
    allocation: Prisma.sql`"WasteMovementReturnAllocation"`,
    issueColumn: Prisma.sql`"wasteIssueDetailId"`
});

// Los nombres SQL proceden exclusivamente de los dos identificadores fijos de este módulo.
// El servicio valida los detalles y conserva el bloqueo del documento durante la escritura.
const updateIssueDetails = ({ tx, table, issueColumn, id, details }) => {
    if (!details.length) return 0;

    const values = details.map(detail => Prisma.sql`(
        ${detail.id}::uuid,
        ${detail.projectConvertedQuantity}::numeric,
        ${detail.convertedQuantityDifference}::numeric,
        ${detail.suppliedQuantity}::numeric,
        ${detail.isSupplied}::boolean,
        ${detail.fulfillmentStatusId}::uuid
    )`);

    return tx.$executeRaw(Prisma.sql`
        UPDATE ${table} AS detail
        SET "projectConvertedQuantity" = change.project_quantity,
            "convertedQuantityDifference" = change.quantity_difference,
            "suppliedQuantity" = change.supplied_quantity,
            "isSupplied" = change.is_supplied,
            "fulfillmentStatusId" = change.status_id,
            "updatedAt" = ${new Date()}
        FROM (VALUES ${Prisma.join(values)}) AS change(
            id, project_quantity, quantity_difference, supplied_quantity, is_supplied, status_id
        )
        WHERE detail."id" = change.id AND detail.${issueColumn} = ${id}::uuid
    `);
};

export const updateGoodsIssueDetails = ({ tx, id, details }) => updateIssueDetails({
    tx,
    table: Prisma.sql`"GoodsIssueDetail"`,
    issueColumn: Prisma.sql`"goodsIssueId"`,
    id,
    details
});

export const updateWasteIssueDetails = ({ tx, id, details }) => updateIssueDetails({
    tx,
    table: Prisma.sql`"WasteIssueDetail"`,
    issueColumn: Prisma.sql`"wasteIssueId"`,
    id,
    details
});
