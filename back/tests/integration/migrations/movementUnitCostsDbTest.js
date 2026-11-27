import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL(
    '../../../prisma/migrations/20261127120000_snapshot_movement_unit_costs/migration.sql', import.meta.url
), 'utf8');

describe('migración de costos unitarios de movimientos', () => {
    it('copia únicamente entradas con evidencia y exige costos numéricos no nulos', async () => {
        const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
        await connection.connect();
        try {
            // Creating the first temporary table makes pg_temp the destination of the unmodified migration.
            await connection.query(`
                CREATE TEMP TABLE "MovementDetail" (
                    "id" UUID PRIMARY KEY, "movementId" INTEGER, "goodsReceiptDetailId" INTEGER,
                    "goodsIssueDetailId" UUID, "materialId" INTEGER, "supplierId" INTEGER, "quantity" DECIMAL(18,6)
                );
                SET search_path TO pg_temp;
                CREATE TEMP TABLE "WasteMovementDetail" ("id" UUID PRIMARY KEY);
                CREATE TEMP TABLE "InventoryMovement" ("id" INTEGER, "type" TEXT, "goodsReceiptId" INTEGER);
                CREATE TEMP TABLE "GoodsReceipt" ("id" INTEGER, "supplierId" INTEGER);
                CREATE TEMP TABLE "GoodsReceiptDetail" (
                    "id" INTEGER, "goodsReceiptId" INTEGER, "materialId" INTEGER,
                    "quantity" DECIMAL(18,6), "conversionUnitCost" DECIMAL(18,6)
                );
                CREATE TEMP TABLE "GoodsReceiptDetailChange" ("goodsReceiptDetailId" INTEGER, "changeType" TEXT);
                INSERT INTO "GoodsReceipt" VALUES (1, 5);
                INSERT INTO "GoodsReceiptDetail" VALUES (1, 1, 6, 2, 12.123456), (2, 1, 6, 2, 25), (3, 1, 6, 2, 'NaN');
                INSERT INTO "GoodsReceiptDetailChange" VALUES (2, 'COST');
                INSERT INTO "InventoryMovement" VALUES (1, 'ENTRY', 1), (2, 'ISSUE', NULL);
            `);
            const originalId = randomUUID();
            const correctedId = randomUUID();
            const differentQuantityId = randomUUID();
            const issueId = randomUUID();
            const invalidCostId = randomUUID();
            await connection.query(`
                INSERT INTO "MovementDetail" VALUES
                    ($1, 1, 1, NULL, 6, 5, 2), ($2, 1, 2, NULL, 6, 5, 2),
                    ($3, 1, 1, NULL, 6, 5, 1), ($4, 2, NULL, gen_random_uuid(), 6, 5, -1),
                    ($5, 1, 3, NULL, 6, 5, 2)
            `, [originalId, correctedId, differentQuantityId, issueId, invalidCostId]);

            await connection.query(migration);

            const { rows } = await connection.query('SELECT * FROM "MovementDetailCost"');
            expect(rows).toEqual([{ movementDetailId: originalId, unitCost: '12.123456', returnSources: [] }]);
            await expect(connection.query(
                'INSERT INTO "MovementDetailCost" ("movementDetailId", "unitCost") VALUES ($1, NULL)', [issueId]
            )).rejects.toMatchObject({ code: '23502' });
            await expect(connection.query(
                'INSERT INTO "MovementDetailCost" ("movementDetailId", "unitCost") VALUES ($1, \'NaN\')', [issueId]
            )).rejects.toMatchObject({ code: '23514' });
        } finally {
            await connection.end();
        }
    });
});
