import { Prisma } from '../../../generated/prisma/client.ts';

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
