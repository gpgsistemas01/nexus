import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261013160000_add_roll_waste_cone_and_total_weight/migration.sql', import.meta.url), 'utf8');

describe('migración consolidada de pesos y vínculo de merma', () => {
    it('conserva netos históricos, crea sólo campos finales y protege pesos e identidades', async () => {
        const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
        await connection.connect();
        try {
            await connection.query('CREATE TEMP TABLE "Material" (LIKE public."Material" INCLUDING ALL)');
            await connection.query('CREATE TEMP TABLE "SupplierMaterial" (LIKE public."SupplierMaterial" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
            await connection.query('ALTER TABLE "SupplierMaterial" DROP COLUMN "referenceConeWeightKg", DROP COLUMN "referenceRollTotalWeightKg"');
            await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
            await connection.query('ALTER TABLE "Waste" DROP COLUMN "coneWeightKg", DROP COLUMN "totalWeightKg", DROP COLUMN "sourceMaterialId"');
            await connection.query('CREATE UNIQUE INDEX "Waste_supplierId_name_base_height_key" ON "Waste" ("supplierId", "name", "base", "height")');
            const supplierId = randomUUID();
            const insert = async (name, net, cone, total, legacy = false) => connection.query(`INSERT INTO "Waste" ("id", "supplierId", "presentationId", "unitMeasureId", "name", "base", "height", "weightKg", "updatedAt"${legacy ? '' : ', "coneWeightKg", "totalWeightKg"'}) VALUES ($1,$2,$2,$2,$3,1.5,2,$4,'2026-10-13'${legacy ? '' : ',$5,$6'})`, legacy ? [randomUUID(), supplierId, name, net] : [randomUUID(), supplierId, name, net, cone, total]);
            await insert('Histórica', '1.23', null, null, true);
            await insert('Sin peso', null, null, null, true);
            const before = (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows;
            await connection.query(migration);
            expect((await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows).toEqual(before.map(row => ({ ...row, coneWeightKg: null, totalWeightKg: null, sourceMaterialId: null })));
            await expect(insert('Histórica', '1.23', null, null)).rejects.toMatchObject({ code: '23505' });
            await insert('Histórica', '0.75', '0.25', '1');
            await insert('Histórica', '0.75', '0.3', '1.05');
            await expect(insert('Histórica', '0.75', '0.25', '1')).rejects.toMatchObject({ code: '23505' });
            for (const [net, cone, total] of [[1, null, 2], [1, 0, null], [1, -1, 0], [1, 2, 2], [1, 0, 2], [1, 100, 102]]) {
                await expect(insert('Inválida', net, cone, total)).rejects.toMatchObject({ code: '23514' });
            }
            await insert('Máximo BD', '999.99', 0, '999.99');
            await expect(insert('Fuera de capacidad', 1000, 0, 1000)).rejects.toMatchObject({ code: '22003' });
            const columns = (await connection.query(`SELECT column_name FROM information_schema.columns WHERE table_schema LIKE 'pg_temp_%' AND table_name='Waste'`)).rows.map(row => row.column_name);
            expect(columns).not.toContain('lengthSource');
            expect(columns).not.toContain('referenceNetWeightKg');
            await connection.query('INSERT INTO "SupplierMaterial" ("supplierId", "materialId", "referenceConeWeightKg", "referenceRollTotalWeightKg") VALUES ($1,$2,0,10)', [randomUUID(), randomUUID()]);
            await expect(connection.query('INSERT INTO "SupplierMaterial" ("supplierId", "materialId", "referenceConeWeightKg", "referenceRollTotalWeightKg") VALUES ($1,$2,1,1)', [randomUUID(), randomUUID()])).rejects.toMatchObject({ code: '23514' });
        } finally {
            await connection.end();
        }
    });
});
