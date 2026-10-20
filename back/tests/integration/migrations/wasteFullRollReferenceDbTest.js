import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261015210000_add_waste_full_roll_reference/migration.sql', import.meta.url), 'utf8');

describe('migración del peso del rollo completo en merma', () => {
  it('conserva las referencias anteriores y exige descontar el mismo cono al peso nuevo', async () => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
      await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
      await connection.query('ALTER TABLE "Waste" DROP COLUMN "referenceRollTotalWeightKg"');
      const id = randomUUID();
      const supplierId = randomUUID();
      await connection.query('INSERT INTO "Waste" ("id","supplierId","presentationId","unitMeasureId","name","base","height","coneWeightKg","totalWeightKg","weightKg","sampleLengthM","sampleNetWeightKg","updatedAt") VALUES ($1,$2,$2,$2,$3,1.5,10,0.25,1.25,1,20,2,$4)', [id, supplierId, 'Histórica', new Date('2026-10-15T12:00:00Z')]);
      const before = (await connection.query('SELECT * FROM "Waste"')).rows;
      await connection.query(migration);
      expect((await connection.query('SELECT * FROM "Waste"')).rows)
        .toEqual(before.map(row => ({ ...row, referenceRollTotalWeightKg: null })));
      await connection.query('UPDATE "Waste" SET "referenceRollTotalWeightKg"=2.25');
      const saved = (await connection.query('SELECT * FROM "Waste"')).rows;
      for (const weight of [0, 0.25, 2.24]) {
        await expect(connection.query('UPDATE "Waste" SET "referenceRollTotalWeightKg"=$1', [weight]))
          .rejects.toMatchObject({ code: '23514' });
      }
      expect((await connection.query('SELECT * FROM "Waste"')).rows).toEqual(saved);
    } finally {
      await connection.end();
    }
  });
});
