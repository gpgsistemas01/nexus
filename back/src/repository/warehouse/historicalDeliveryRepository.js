import { Prisma } from '../../../generated/prisma/client.ts';

export const lockHistoricalDeliveryOperation = ({ tx, userId, operationId }) => tx.$executeRaw`
    SELECT pg_advisory_xact_lock(hashtextextended(${`${userId}:${operationId}:historical-delivery`}, 0))
`;

export const lockHistoricalDeliveryDocuments = ({ tx, resource, ids }) => tx.$queryRaw(Prisma.sql`
    SELECT "id" FROM ${Prisma.raw(resource === 'wastes' ? '"WasteIssue"' : '"GoodsIssue"')}
    WHERE "id" IN (${Prisma.join(ids.map(id => Prisma.sql`${id}::uuid`))})
    ORDER BY "id" FOR UPDATE
`);
