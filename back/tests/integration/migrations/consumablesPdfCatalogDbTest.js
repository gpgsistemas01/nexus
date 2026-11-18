import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261118180000_seed_consumables_pdf_catalog/migration.sql', import.meta.url), 'utf8');
const withCatalog = async run => {
  const db = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
  await db.connect();
  try {
    for (const table of ['Presentation', 'UnitMeasure', 'Material']) {
      await db.query(`CREATE TEMP TABLE "${table}" (LIKE public."${table}" INCLUDING ALL)`);
    }
    await run(db);
  } finally { await db.end(); }
};
const snapshot = async db => (await db.query('SELECT * FROM "Material" ORDER BY id')).rows;

describe('catálogo de LISTA CONSUMIBLES.pdf (CP-INT-CAT-PDF-001)', () => {
  it('registra las 237 identidades sin proveedor ni saldo y repetir no crea duplicados', async () => {
    await withCatalog(async db => {
      const offers = (await db.query('SELECT COUNT(*) AS n FROM public."SupplierMaterial"')).rows[0].n;
      await db.query(migration);
      const rows = await snapshot(db);
      expect(rows).toHaveLength(237);
      expect(rows.every(row => row.type === 'CONSUMABLE' && row.base === null && row.height === null && Number(row.minStock) === 0)).toBe(true);
      const catalogs = (await db.query('SELECT p.name AS presentation, u.symbol FROM "Material" m JOIN "Presentation" p ON p.id=m."presentationId" JOIN "UnitMeasure" u ON u.id=m."unitMeasureId" GROUP BY p.name,u.symbol')).rows;
      expect(catalogs).toEqual([{ presentation: 'PIEZA', symbol: 'PZA.' }]);
      await db.query(migration);
      expect(await snapshot(db)).toEqual(rows);
      expect((await db.query('SELECT COUNT(*) AS n FROM public."SupplierMaterial"')).rows[0].n).toBe(offers);
      expect(rows.filter(row => /TUERCAS? 3\/16/.test(row.name))).toHaveLength(1);
    });
  });

  it('reutiliza variantes revisadas y conserva identidades, SKU, medidas y mínimos existentes', async () => {
    await withCatalog(async db => {
      const p = (await db.query('INSERT INTO "Presentation" (name) VALUES (\'KILOGRAMOS\') RETURNING id')).rows[0].id;
      const u = (await db.query('INSERT INTO "UnitMeasure" (name,symbol) VALUES (\'KILOGRAMO\',\'kg\') RETURNING id')).rows[0].id;
      const names = ['ALAMBRE GALVANIZADO CAL. 14', 'CABLE POT #16', 'KOLA LOKA KLM - 2000', 'KOLA LOKA KL2 - 1200', 'TORNILLO DE PLASTICO', 'VENTOSA MEDIANA', "BROCA PARA METAL 3/8''", 'SILVATRIN NEGRO'];
      for (const name of names) await db.query('INSERT INTO "Material" (name,sku,"presentationId","unitMeasureId",base,height,"minStock",type) VALUES ($1,$1,$2,$3,1,45,5,\'CONSUMABLE\')', [name,p,u]);
      const before = await snapshot(db);
      await db.query(migration);
      const after = await snapshot(db);
      expect(after).toHaveLength(238); // catálogo más SILVATRIN, que no aparece en el PDF
      for (const row of before) expect(after.find(item => item.id === row.id)).toEqual(row);
      expect(after.filter(row => row.name.startsWith('KOLA LOKA'))).toHaveLength(2);
      expect(after.filter(row => row.name.startsWith('BROCA PARA METAL 3/8'))).toHaveLength(1);
    });
  });
});
