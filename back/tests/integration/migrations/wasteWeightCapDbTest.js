import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261012233000_limit_roll_waste_weight_to_100kg/migration.sql', import.meta.url), 'utf8');

const withLegacyWaste = async callback => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING ALL)');
        await connection.query('ALTER TABLE "Waste" DROP CONSTRAINT "Waste_weightKg_maximum"');
        await connection.query('ALTER TABLE "Waste" ALTER COLUMN "weightKg" TYPE DECIMAL(18,6)');
        await callback(connection);
    } finally {
        await connection.end();
    }
};

const insertWaste = async (connection, weight) => {
    const id = randomUUID();
    await connection.query(`INSERT INTO "Waste" ("id", "supplierId", "presentationId", "unitMeasureId", "name", "weightKg", "base", "height", "currentStock", "convertedQuantity", "updatedAt")
        VALUES ($1, $2, $2, $2, $3, $4, 1.5, 2, 3, 9, '2026-10-12')`, [id, randomUUID(), `Migration ${id}`, weight]);
};
const snapshot = async connection => (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows;
const columnDefinition = async connection => (await connection.query(`SELECT numeric_precision, numeric_scale FROM information_schema.columns
    WHERE table_schema = (SELECT nspname FROM pg_namespace WHERE oid = pg_my_temp_schema()) AND table_name = 'Waste' AND column_name = 'weightKg'`)).rows[0];

describe('migración del peso unitario de merma a máximo 100 kg', () => {
    it('conserva peso desconocido, seis decimales, el valor 100 y los demás datos', async () => {
        await withLegacyWaste(async connection => {
            for (const weight of [null, '0.000001', '1.234567', '99.999999', '100']) await insertWaste(connection, weight);
            const before = await snapshot(connection);
            await connection.query(migration);
            expect(await snapshot(connection)).toEqual(before);
            expect(await columnDefinition(connection)).toEqual({ numeric_precision: 9, numeric_scale: 6 });
            await expect(insertWaste(connection, '100.000001')).rejects.toMatchObject({ code: '23514' });
            expect(await snapshot(connection)).toEqual(before);
        });
    });

    it('detiene toda la migración ante un peso histórico mayor de 100, sin recortarlo ni modificar otros datos', async () => {
        await withLegacyWaste(async connection => {
            await insertWaste(connection, '1.234567');
            await insertWaste(connection, '100.000001');
            const before = await snapshot(connection);
            await expect(connection.query(migration)).rejects.toMatchObject({ code: '23514' });
            await connection.query('ROLLBACK');
            expect(await snapshot(connection)).toEqual(before);
            expect(await columnDefinition(connection)).toEqual({ numeric_precision: 18, numeric_scale: 6 });
        });
    });
});
