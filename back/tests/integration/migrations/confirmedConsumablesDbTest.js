import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL(
  '../../../prisma/migrations/20261103000000_reclassify_six_confirmed_consumables/migration.sql',
  import.meta.url
), 'utf8');
const confirmed = [
  ['e1a442d3-7fa8-47f7-b606-303294607c0b', 'PLAYO', 'PLA-1'],
  ['7dd8df51-b784-4f3e-9ecf-645e2c71931a', 'HULE BURBUJA', 'HUL-BUR-1'],
  ['dccb3ce9-d514-4993-b67f-0e5eb6b6fb1b', 'PAPEL KRAFT', 'PAP-KRA-1'],
  ['7eab9db1-64f4-4016-ada3-73d842ccc463', 'MALLA VERDE', 'MAL-VER-1'],
  ['fdb3c7f0-558f-45df-8608-ea8f877c933f', 'KOLA LOKA KLM - 2000', 'KOL-LOK-KLM-2000-1'],
  ['dcb5c66f-5fca-47f2-9e75-166f9427c2da', 'KOLA LOKA KL2 - 1200', 'KOL-LOK-KL2-1200-1']
];
const presentationId = '9c60a860-90dc-4f8e-bee0-d0c92928695c';
const unitMeasureId = '3cbf98f2-5502-477d-bd4e-f717f9e5bd53';

const withTable = async callback => {
  const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
  await connection.connect();
  try {
    await connection.query('CREATE TEMP TABLE "Material" (LIKE public."Material" INCLUDING ALL)');
    await connection.query(`CREATE TRIGGER "Material_increment_version" BEFORE UPDATE ON "Material"
      FOR EACH ROW EXECUTE FUNCTION public.nexus_increment_record_version()`);
    await callback(connection);
  } finally {
    await connection.end();
  }
};

const insertMaterial = async (connection, [id, name, sku], overrides = {}) => {
  const row = { id, name, sku, presentationId, unitMeasureId, base: null, height: null, type: 'MATERIAL', ...overrides };
  await connection.query(`INSERT INTO "Material"
    ("id", "name", "sku", "presentationId", "unitMeasureId", "base", "height", "type")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, Object.values(row));
};
const snapshot = async connection => (await connection.query('SELECT * FROM "Material" ORDER BY "id"')).rows;

describe('reclasificación de los seis consumibles confirmados', () => {
  it('cambia solo el tipo de los seis IDs y conserva los dos candidatos no autorizados', async () => {
    await withTable(async connection => {
      for (const row of confirmed) await insertMaterial(connection, row);
      await insertMaterial(connection, ['12759e60-d56d-4dfc-8f4e-a223c606fade', 'TORNILLO DE PLASTICO', 'TOR-PLA-1']);
      await insertMaterial(connection, ['5efea6dd-f15a-4f98-b1dc-9d62a4f45341', 'VENTOSA MEDIANA', 'VEN-MED-1']);
      const before = await snapshot(connection);
      expect((await connection.query(migration)).rowCount).toBe(6);
      const after = await snapshot(connection);
      const ids = new Set(confirmed.map(([id]) => id));
      expect(after).toEqual(before.map(row => ids.has(row.id)
        ? { ...row, type: 'CONSUMABLE', version: row.version + 1 } : row));
      expect((await connection.query(migration)).rowCount).toBe(0);
      expect(await snapshot(connection)).toEqual(after);
    });
  });

  it('conserva identidades modificadas y nombres iguales con otro ID', async () => {
    await withTable(async connection => {
      const changes = [{ name: 'PLAYO MODIFICADO' }, { sku: 'OTRO-SKU' },
        { presentationId: randomUUID() }, { unitMeasureId: randomUUID() }, { base: 1 }, { height: 1 }];
      for (const [index, row] of confirmed.entries()) await insertMaterial(connection, row, changes[index]);
      await insertMaterial(connection, [randomUUID(), 'PLAYO', 'PLAYO-OTRO-ID']);
      const before = await snapshot(connection);
      expect((await connection.query(migration)).rowCount).toBe(0);
      expect(await snapshot(connection)).toEqual(before);
    });
  });

  it('admite catálogo vacío, IDs ausentes y registros ya consumibles', async () => {
    await withTable(async connection => {
      expect((await connection.query(migration)).rowCount).toBe(0);
      await insertMaterial(connection, confirmed[0], { type: 'CONSUMABLE' });
      const before = await snapshot(connection);
      expect((await connection.query(migration)).rowCount).toBe(0);
      expect(await snapshot(connection)).toEqual(before);
    });
  });

  it('revierte la sentencia completa si existe una identidad consumible equivalente', async () => {
    await withTable(async connection => {
      for (const row of confirmed) await insertMaterial(connection, row);
      await insertMaterial(connection, [randomUUID(), 'PLAYO', 'PLAYO-CONSUMIBLE'], { type: 'CONSUMABLE' });
      const before = await snapshot(connection);
      await expect(connection.query(migration)).rejects.toMatchObject({ code: '23505' });
      expect(await snapshot(connection)).toEqual(before);
    });
  });
});

const additionalMigration = readFileSync(new URL(
  '../../../prisma/migrations/20261103010000_reclassify_screw_and_suction_cup/migration.sql',
  import.meta.url
), 'utf8');
const additional = [
  ['12759e60-d56d-4dfc-8f4e-a223c606fade', 'TORNILLO DE PLASTICO', 'TOR-PLA-1'],
  ['5efea6dd-f15a-4f98-b1dc-9d62a4f45341', 'VENTOSA MEDIANA', 'VEN-MED-1']
];

describe('reclasificación incremental del tornillo y la ventosa', () => {
  it('conserva nombres, datos y los seis consumibles anteriores; repetir no incrementa versiones', async () => {
    await withTable(async connection => {
      for (const row of [...confirmed, ...additional]) await insertMaterial(connection, row);
      await insertMaterial(connection, [randomUUID(), 'OTRO MATERIAL', 'OTRO-1']);
      await connection.query(migration);
      const before = await snapshot(connection);
      expect((await connection.query(additionalMigration)).rowCount).toBe(2);
      const after = await snapshot(connection);
      const ids = new Set(additional.map(([id]) => id));
      expect(after).toEqual(before.map(row => ids.has(row.id)
        ? { ...row, type: 'CONSUMABLE', version: row.version + 1 } : row));
      expect((await connection.query(additionalMigration)).rowCount).toBe(0);
      expect(await snapshot(connection)).toEqual(after);
    });
  });

  it('admite catálogo vacío y omite identidades modificadas u otros IDs', async () => {
    await withTable(async connection => {
      expect((await connection.query(additionalMigration)).rowCount).toBe(0);
      await insertMaterial(connection, additional[0], { name: 'TORNILLO DIFERENTE' });
      await insertMaterial(connection, additional[1], { sku: 'OTRO-SKU' });
      await insertMaterial(connection, [randomUUID(), 'VENTOSA MEDIANA', 'VEN-OTRA']);
      const before = await snapshot(connection);
      expect((await connection.query(additionalMigration)).rowCount).toBe(0);
      expect(await snapshot(connection)).toEqual(before);
    });
  });

  it('revierte ambos cambios si ya existe un consumible con la misma identidad', async () => {
    await withTable(async connection => {
      for (const row of additional) await insertMaterial(connection, row);
      await insertMaterial(connection, [randomUUID(), 'VENTOSA MEDIANA', 'VEN-DUP'], { type: 'CONSUMABLE' });
      const before = await snapshot(connection);
      await expect(connection.query(additionalMigration)).rejects.toMatchObject({ code: '23505' });
      expect(await snapshot(connection)).toEqual(before);
    });
  });
});
