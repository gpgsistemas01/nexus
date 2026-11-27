import { Prisma } from '../../../generated/prisma/client.ts';

const findMovementDatePage = async ({ db, model, query, movement, detail, dateRange, orderDir, contextJoin, contextFilter }) => {
    const filters = contextFilter ? [contextFilter] : [];
    if (dateRange?.gte) filters.push(Prisma.sql`movement.date >= ${dateRange.gte}::timestamp`);
    if (dateRange?.lt) filters.push(Prisma.sql`movement.date < ${dateRange.lt}::timestamp`);
    const direction = orderDir === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    // Un detalle siempre tiene cabecera. El INNER JOIN permite comenzar por el índice de fecha.
    const selectedRows = await db.$queryRaw(Prisma.sql`
        SELECT detail.id
        FROM ${movement} AS movement
        JOIN ${detail} AS detail ON detail."movementId" = movement.id
        ${contextJoin ?? Prisma.empty}
        ${filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}` : Prisma.empty}
        ORDER BY movement.date ${direction}, detail.id ASC
        LIMIT ${query.take} OFFSET ${query.skip}
    `);
    if (!selectedRows.length) return [];

    // Vuelve a comprobar el alcance al hidratar las filas y conserva el orden de los ids.
    const ids = selectedRows.map(row => row.id);
    const rows = await model.findMany({ select: query.select, where: { AND: [query.where, { id: { in: ids } }] } });
    const byId = new Map(rows.map(row => [row.id, row]));
    return ids.map(id => byId.get(id)).filter(Boolean);
};

export const findInventoryMovementDatePage = ({ db, query, type, dateRange, orderDir }) => findMovementDatePage({
    db, model: db.movementDetail, query, dateRange, orderDir,
    movement: Prisma.sql`"InventoryMovement"`,
    detail: Prisma.sql`"MovementDetail"`,
    // Mismo alcance de materialDetailTypeWhere para partidas anteriores al snapshot.
    contextJoin: Prisma.sql`LEFT JOIN "Material" AS item ON item.id = detail."materialId" AND detail."materialType" IS NULL`,
    contextFilter: Prisma.sql`(detail."materialType" = ${type}::"MaterialType"
        OR (detail."materialType" IS NULL AND item.type = ${type}::"MaterialType"))`
});

export const findWasteMovementDatePage = ({ db, query, dateRange, orderDir }) => findMovementDatePage({
    db, model: db.wasteMovementDetail, query, dateRange, orderDir,
    movement: Prisma.sql`"WasteMovement"`,
    detail: Prisma.sql`"WasteMovementDetail"`
});

const findMovementCosts = async ({ db, ids, cost, allocation }) => {
    if (!ids.length) return new Map();

    // El primer origen es suficiente porque la devolución agrupa surtidos del mismo costo.
    const rows = await db.$queryRaw(Prisma.sql`
        SELECT page.id, COALESCE(direct."unitCost", (
            SELECT source."unitCost"
            FROM ${allocation} AS allocation
            JOIN ${cost} AS source ON source."movementDetailId" = allocation."sourceMovementDetailId"
            WHERE allocation."returnMovementDetailId" = page.id
            ORDER BY allocation."sourceMovementDetailId"
            LIMIT 1
        )) AS "unitCost"
        FROM unnest(${ids}::uuid[]) AS page(id)
        LEFT JOIN ${cost} AS direct ON direct."movementDetailId" = page.id
    `);
    return new Map(rows.map(row => [row.id, row.unitCost]));
};

export const findInventoryMovementCosts = ({ db, ids }) => findMovementCosts({
    db, ids,
    cost: Prisma.sql`"MovementDetailCost"`,
    allocation: Prisma.sql`"MovementReturnAllocation"`
});

export const findWasteMovementCosts = ({ db, ids }) => findMovementCosts({
    db, ids,
    cost: Prisma.sql`"WasteMovementDetailCost"`,
    allocation: Prisma.sql`"WasteMovementReturnAllocation"`
});
