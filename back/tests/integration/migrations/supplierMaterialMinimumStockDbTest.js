import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL(
  '../../../prisma/migrations/20261120200000_move_minimum_stock_to_supplier_material/migration.sql',
  import.meta.url
), 'utf8');

it('traslada el mínimo a cada vínculo conservando saldo y costo (CP-INT-ALM-011)', async () => {
  const db = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
  await db.connect();
  try {
    await db.query(`
      CREATE TEMP TABLE "Material" (id integer PRIMARY KEY, "minStock" numeric(18,6) NOT NULL DEFAULT 0);
      CREATE TEMP TABLE "SupplierMaterial" (
        id integer PRIMARY KEY, "materialId" integer REFERENCES "Material"(id),
        "currentStock" numeric(18,6) NOT NULL, "maxUnitCost" numeric(18,6) NOT NULL
      );
      INSERT INTO "Material" VALUES (1, 3.25), (2, 0), (3, 6);
      INSERT INTO "SupplierMaterial" VALUES (1, 1, 4, 12), (2, 1, 1.75, 10), (3, 2, 0, 15);
    `);
    await db.query(migration);
    const { rows } = await db.query(`
      SELECT id, "minStock"::float8 AS minimum, "currentStock"::float8 AS stock,
        "maxUnitCost"::float8 AS cost
      FROM "SupplierMaterial" ORDER BY id
    `);
    expect(rows).toEqual([
      { id: 1, minimum: 3.25, stock: 4, cost: 12 },
      { id: 2, minimum: 3.25, stock: 1.75, cost: 10 },
      { id: 3, minimum: 0, stock: 0, cost: 15 }
    ]);
    expect((await db.query('SELECT * FROM "Material" ORDER BY id')).rows).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const newOffer = await db.query('INSERT INTO "SupplierMaterial" (id, "materialId", "currentStock", "maxUnitCost") VALUES (4, 3, 0, 1) RETURNING "minStock"::float8 AS minimum');
    expect(newOffer.rows[0].minimum).toBe(0);
  } finally { await db.end(); }
});
