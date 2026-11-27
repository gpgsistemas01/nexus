import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL(
    '../../../prisma/migrations/20261127130000_normalize_movement_return_allocations/migration.sql', import.meta.url
), 'utf8');

const ledgers = [
    { movement: 'InventoryMovement', detail: 'MovementDetail', issueColumn: 'goodsIssueDetailId', allocation: 'MovementReturnAllocation' },
    { movement: 'WasteMovement', detail: 'WasteMovementDetail', issueColumn: 'wasteIssueDetailId', allocation: 'WasteMovementReturnAllocation' }
];

const withLegacyReturns = async (callback) => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        await connection.query('CREATE TEMP TABLE migration_scope (id INT); SET search_path TO pg_temp;');
        const [first, second, returned, issue] = Array.from({ length: 4 }, () => randomUUID());
        for (const { movement, detail, issueColumn } of ledgers) {
            await connection.query(`
                CREATE TABLE "${movement}" ("id" INTEGER PRIMARY KEY, "type" TEXT NOT NULL);
                CREATE TABLE "${detail}" (
                    "id" UUID PRIMARY KEY, "movementId" INTEGER NOT NULL REFERENCES "${movement}"("id"),
                    "${issueColumn}" UUID, "quantity" DECIMAL(18,6) NOT NULL
                );
                CREATE TABLE "${detail}Cost" (
                    "movementDetailId" UUID PRIMARY KEY REFERENCES "${detail}"("id"),
                    "unitCost" DECIMAL(18,6) NOT NULL, "returnSources" JSONB NOT NULL DEFAULT '[]'
                );
                INSERT INTO "${movement}" VALUES (1, 'ISSUE'), (2, 'ISSUE'), (3, 'ENTRY');
            `);
            await connection.query(`
                INSERT INTO "${detail}" VALUES ($1, 1, $4, -0.333333), ($2, 2, $4, -1), ($3, 3, $4, 1);
            `, [first, second, returned, issue]);
            await connection.query(`
                INSERT INTO "${detail}Cost" VALUES ($1, 12.123456, '[]'), ($2, 12.123456, '[]'), ($3, 12.123456, $4);
            `, [first, second, returned, JSON.stringify([
                { movementDetailId: first, quantity: 0.333333 }, { movementDetailId: second, quantity: 0.666667 }
            ])]);
        }
        await callback(connection, { first, second, returned });
    } finally {
        await connection.end();
    }
};

describe('migración de asignaciones de devolución', () => {
    it('conserva las fuentes y sus decimales exactos y elimina los costos duplicados', async () => {
        await withLegacyReturns(async (connection, { first, second, returned }) => {
            await connection.query(migration);
            for (const { detail, allocation } of ledgers) {
                const { rows } = await connection.query(`
                    SELECT link."sourceMovementDetailId", link."quantity", cost."unitCost"
                    FROM "${allocation}" AS link JOIN "${detail}Cost" AS cost
                        ON cost."movementDetailId" = link."sourceMovementDetailId"
                    WHERE link."returnMovementDetailId" = $1 ORDER BY link."quantity"
                `, [returned]);
                expect(rows).toEqual([
                    { sourceMovementDetailId: first, quantity: '0.333333', unitCost: '12.123456' },
                    { sourceMovementDetailId: second, quantity: '0.666667', unitCost: '12.123456' }
                ]);
                expect((await connection.query(`SELECT * FROM "${detail}Cost" WHERE "movementDetailId" = $1`, [returned])).rows).toEqual([]);
                await expect(connection.query(`DELETE FROM "${detail}Cost" WHERE "movementDetailId" = $1`, [first]))
                    .rejects.toMatchObject({ code: '23503' });
            }
        });
    });

    it('revierte ambos inventarios si un costo de origen difiere del importe histórico', async () => {
        await withLegacyReturns(async (connection, { returned }) => {
            await connection.query('UPDATE "WasteMovementDetailCost" SET "unitCost" = 10 WHERE "movementDetailId" = $1', [returned]);
            await expect(connection.query(migration)).rejects.toThrow(/no coinciden con su costo o saldo/);
            await connection.query('ROLLBACK');
            for (const { detail, allocation } of ledgers) {
                const { rows } = await connection.query(`SELECT "returnSources" FROM "${detail}Cost" WHERE "movementDetailId" = $1`, [returned]);
                expect(rows[0].returnSources).toHaveLength(2);
                const result = await connection.query('SELECT to_regclass($1) AS table', [`"${allocation}"`]);
                expect(result.rows[0].table).toBeNull();
            }
        });
    });
});
