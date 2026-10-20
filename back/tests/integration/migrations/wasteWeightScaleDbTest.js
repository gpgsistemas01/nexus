import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261013153000_limit_roll_waste_weight_to_two_decimals/migration.sql', import.meta.url), 'utf8');

const withLegacyWaste = async callback => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING ALL)');
        await connection.query('ALTER TABLE "Waste" ALTER COLUMN "weightKg" TYPE DECIMAL(9,6)');
        // Reconstruct the constraint that existed before this historical migration.
        await connection.query('ALTER TABLE "Waste" DROP CONSTRAINT "Waste_weightKg_maximum"');
        await connection.query('ALTER TABLE "Waste" ADD CONSTRAINT "Waste_weightKg_maximum" CHECK ("weightKg" IS NULL OR "weightKg" <= 100)');
        await callback(connection);
    } finally {
        await connection.end();
    }
};

const insertWaste = async (connection, weight) => {
    const id = randomUUID();
    await connection.query(`INSERT INTO "Waste" ("id", "supplierId", "presentationId", "unitMeasureId", "name", "weightKg", "base", "height", "currentStock", "convertedQuantity", "updatedAt")
        VALUES ($1, $2, $2, $2, $3, $4, 1.5, 2, 3, 9, '2026-10-13')`, [id, randomUUID(), `Migration ${id}`, weight]);
};
const snapshot = async connection => (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows
    .map(row => ({ ...row, weightKg: row.weightKg === null ? null : Number(row.weightKg) }));
const columnDefinition = async connection => (await connection.query(`SELECT numeric_precision, numeric_scale FROM information_schema.columns
    WHERE table_schema = (SELECT nspname FROM pg_namespace WHERE oid = pg_my_temp_schema()) AND table_name = 'Waste' AND column_name = 'weightKg'`)).rows[0];

describe('migración del peso unitario de merma a tres enteros y dos decimales', () => {
    it('conserva pesos, datos y restricciones al reducir la escala a dos decimales', async () => {
        await withLegacyWaste(async connection => {
            for (const weight of [null, '0.010000', '1.230000', '99.990000', '100.000000']) await insertWaste(connection, weight);
            const before = await snapshot(connection);
            await connection.query(migration);
            expect(await snapshot(connection)).toEqual(before);
            expect(await columnDefinition(connection)).toEqual({ numeric_precision: 5, numeric_scale: 2 });
            for (const weight of ['0', '-0.01', '100.01']) {
                await expect(insertWaste(connection, weight)).rejects.toMatchObject({ code: '23514' });
            }
            expect(await snapshot(connection)).toEqual(before);
        });
    });

    it.each(['1.234567', '0.001'])('detiene la migración ante %s sin redondear el peso ni alterar otros datos', async weight => {
        await withLegacyWaste(async connection => {
            await insertWaste(connection, '1.230000');
            await insertWaste(connection, weight);
            const before = await snapshot(connection);
            await expect(connection.query(migration)).rejects.toMatchObject({ code: '23514' });
            await connection.query('ROLLBACK');
            expect(await snapshot(connection)).toEqual(before);
            expect(await columnDefinition(connection)).toEqual({ numeric_precision: 9, numeric_scale: 6 });
        });
    });
});
