// Todas las operaciones que cambian un documento adquieren su bloqueo antes de leer sus detalles.
// PostgreSQL lo libera al confirmar o revertir el tx recibido.
export const lockGoodsIssue = ({ tx, id }) => tx.$queryRaw`
    SELECT "id" FROM "GoodsIssue" WHERE "id" = ${id}::uuid FOR UPDATE
`;

export const lockWasteIssue = ({ tx, id }) => tx.$queryRaw`
    SELECT "id" FROM "WasteIssue" WHERE "id" = ${id}::uuid FOR UPDATE
`;

export const lockGoodsReceipt = ({ tx, id }) => tx.$queryRaw`
    SELECT "id" FROM "GoodsReceipt" WHERE "id" = ${id}::uuid FOR UPDATE
`;
