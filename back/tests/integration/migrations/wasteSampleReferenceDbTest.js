import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261015190000_add_waste_sample_reference/migration.sql', import.meta.url), 'utf8');

describe('migración de muestra de merma', () => {
  it('conserva registros históricos y sólo admite una muestra completa y positiva', async () => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
      await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
      await connection.query('ALTER TABLE "Waste" DROP COLUMN "sampleLengthM", DROP COLUMN "sampleNetWeightKg"');
      const supplierId = randomUUID();
      await connection.query('INSERT INTO "Waste" ("id", "supplierId", "presentationId", "unitMeasureId", "name", "base", "height", "weightKg", "updatedAt") VALUES ($1,$2,$2,$2,$3,1.5,2,1,$4)', [randomUUID(), supplierId, 'Histórica', new Date('2026-10-15T12:00:00Z')]);
      const before = (await connection.query('SELECT * FROM "Waste"')).rows;
      await connection.query(migration);
      expect((await connection.query('SELECT * FROM "Waste"')).rows).toEqual(before.map(row => ({ ...row, sampleLengthM: null, sampleNetWeightKg: null })));
      await connection.query('UPDATE "Waste" SET "sampleLengthM"=1, "sampleNetWeightKg"=0.057');
      const saved = (await connection.query('SELECT "sampleLengthM", "sampleNetWeightKg" FROM "Waste"')).rows[0];
      expect(Number(saved.sampleNetWeightKg)).toBe(0.057);
      for (const [length, weight] of [[1, null], [null, 0.2], [0, 0.2], [1, 0], [-1, 0.2]]) {
        await expect(connection.query('UPDATE "Waste" SET "sampleLengthM"=$1, "sampleNetWeightKg"=$2', [length, weight]))
          .rejects.toMatchObject({ code: '23514' });
      }
      expect((await connection.query('SELECT "sampleLengthM", "sampleNetWeightKg" FROM "Waste"')).rows[0]).toEqual(saved);
    } finally { await connection.end(); }
  });
});
