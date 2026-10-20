import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const previousMigration = readFileSync(new URL('../../../prisma/migrations/20261015210000_add_waste_full_roll_reference/migration.sql', import.meta.url), 'utf8');
const previousConstraint = previousMigration.slice(previousMigration.indexOf('ALTER TABLE "Waste" ADD CONSTRAINT'));
const migration = readFileSync(new URL('../../../prisma/migrations/20261015230000_stop_persisting_waste_sample_values/migration.sql', import.meta.url), 'utf8');

const insertWaste = 'INSERT INTO "Waste" ("id","supplierId","presentationId","unitMeasureId","name","base","height","coneWeightKg","totalWeightKg","weightKg","sampleLengthM","sampleNetWeightKg","referenceRollTotalWeightKg","updatedAt") VALUES ($1,$2,$2,$2,$3,1.5,10,0.25,1.25,1,$4,$5,$6,$7)';

describe('migración de referencias de muestra sólo históricas', () => {
  it('conserva muestras anteriores y admite nuevas mermas sin persistir largo ni neto de muestra', async () => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
      await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
      await connection.query('ALTER TABLE "Waste" DROP CONSTRAINT "Waste_full_roll_reference_check"');
      await connection.query(previousConstraint);
      const supplierId = randomUUID();
      const completeRollId = randomUUID();
      const date = new Date('2026-10-15T12:00:00Z');
      await connection.query(insertWaste, [completeRollId, supplierId, 'Rollo anterior', 20, 2, 2.25, date]);
      await connection.query(insertWaste, [randomUUID(), supplierId, 'Muestra parcial anterior', 0.57, 0.057, null, date]);
      const before = (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows;
      const newId = randomUUID();
      const newWaste = [newId, supplierId, 'Nuevo rollo', null, null, 2.25, date];
      await expect(connection.query(insertWaste, newWaste)).rejects.toMatchObject({ code: '23514' });
      await connection.query(migration);
      expect((await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows).toEqual(before);
      await connection.query(insertWaste, newWaste);
      const saved = (await connection.query('SELECT * FROM "Waste" WHERE "id"=$1', [newId])).rows[0];
      expect(saved).toMatchObject({ sampleLengthM: null, sampleNetWeightKg: null, referenceRollTotalWeightKg: '2.25' });
      for (const total of [0, 0.25]) {
        await expect(connection.query('UPDATE "Waste" SET "referenceRollTotalWeightKg"=$1 WHERE "id"=$2', [total, newId]))
          .rejects.toMatchObject({ code: '23514' });
      }
      await expect(connection.query('UPDATE "Waste" SET "referenceRollTotalWeightKg"=2.24 WHERE "id"=$1', [completeRollId]))
        .rejects.toMatchObject({ code: '23514' });
      expect((await connection.query('SELECT * FROM "Waste" WHERE "id"<>$1 ORDER BY "id"', [newId])).rows).toEqual(before);
      expect((await connection.query('SELECT * FROM "Waste" WHERE "id"=$1', [newId])).rows[0]).toEqual(saved);
    } finally {
      await connection.end();
    }
  });
});
