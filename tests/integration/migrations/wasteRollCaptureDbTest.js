import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261013160000_add_roll_waste_cone_and_total_weight/migration.sql', import.meta.url), 'utf8');

describe('migración de peso del cono y total por unidad de merma', () => {
    it('conserva pesos netos históricos y exige capturas completas y coherentes en PostgreSQL', async () => {
        const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
        await connection.connect();
        try {
            await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING ALL)');
            await connection.query('ALTER TABLE "Waste" DROP CONSTRAINT "Waste_roll_weight_capture", DROP COLUMN "coneWeightKg", DROP COLUMN "totalWeightKg"');
            const insert = async (weightKg, coneWeightKg, totalWeightKg, legacy = false) => {
                const id = randomUUID();
                await connection.query(`INSERT INTO "Waste" ("id", "supplierId", "presentationId", "unitMeasureId", "name", "weightKg", "base", "height", "currentStock", "convertedQuantity", "updatedAt"${legacy ? '' : ', "coneWeightKg", "totalWeightKg"'})
                    VALUES ($1, $2, $2, $2, $3, $4, 1.5, 2, 3, 9, '2026-10-13'${legacy ? '' : ', $5, $6'})`,
                legacy ? [id, randomUUID(), `Migration ${id}`, weightKg] : [id, randomUUID(), `Migration ${id}`, weightKg, coneWeightKg, totalWeightKg]);
            };
            await insert('1.23', null, null, true);
            await insert(null, null, null, true);
            const before = (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows;
            await connection.query(migration);
            const after = (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows;
            expect(after).toEqual(before.map(row => ({ ...row, coneWeightKg: null, totalWeightKg: null })));
            await insert('0.75', '0.25', '1');
            await insert('100', '0', '100');
            for (const [net, cone, total] of [[1, null, 2], [1, 0, null], [1, -1, 0], [1, 2, 2], [1, 3, 2], [1, 0, 2], [1, 100, 101]]) {
                await expect(insert(net, cone, total)).rejects.toMatchObject({ code: '23514' });
            }
            expect((await connection.query('SELECT COUNT(*)::int AS count FROM "Waste"')).rows[0].count).toBe(4);
        } finally {
            await connection.end();
        }
    });

    it('migra referencias sin inventar datos históricos y distingue identidades por pesos', async () => {
        const sql = readFileSync(new URL('../../../prisma/migrations/20261013170000_add_roll_references_and_weight_identity/migration.sql', import.meta.url), 'utf8');
        const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
        await connection.connect();
        try {
            await connection.query('CREATE TEMP TABLE "Material" (LIKE public."Material" INCLUDING ALL)');
            await connection.query('CREATE TEMP TABLE "SupplierMaterial" (LIKE public."SupplierMaterial" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
            await connection.query('ALTER TABLE "SupplierMaterial" DROP COLUMN "referenceConeWeightKg", DROP COLUMN "referenceRollTotalWeightKg"');
            await connection.query('CREATE TEMP TABLE "Waste" (LIKE public."Waste" INCLUDING DEFAULTS INCLUDING CONSTRAINTS)');
            await connection.query('ALTER TABLE "Waste" DROP COLUMN "sourceMaterialId", DROP COLUMN "lengthSource"');
            await connection.query('CREATE UNIQUE INDEX "Waste_supplierId_name_base_height_key" ON "Waste" ("supplierId", "name", "base", "height")');
            const supplierId = randomUUID();
            const insert = async (cone, total) => connection.query(`INSERT INTO "Waste" ("id", "supplierId", "presentationId", "unitMeasureId", "name", "base", "height", "weightKg", "coneWeightKg", "totalWeightKg", "updatedAt") VALUES ($1,$2,$2,$2,'Merma histórica',1.5,2,$3,$4,$5,'2026-10-13')`, [randomUUID(), supplierId, cone == null ? '1.23' : Number(total) - Number(cone), cone, total]);
            await insert(null, null);
            const before = (await connection.query('SELECT * FROM "Waste"')).rows[0];
            await connection.query(sql);
            const after = (await connection.query('SELECT * FROM "Waste"')).rows[0];
            expect(after).toEqual({ ...before, sourceMaterialId: null, referenceConeWeightKg: null, referenceConeWeightMode: null, coneWeightSource: null, lengthSource: 'MEASURED', referenceNetWeightKg: null, referenceLengthM: null, referenceWidthM: null });
            await expect(insert(null, null)).rejects.toMatchObject({ code: '23505' });
            await insert('0.25', '1');
            await insert('0.30', '1.05');
            await expect(insert('0.25', '1')).rejects.toMatchObject({ code: '23505' });
            expect((await connection.query('SELECT COUNT(*)::int AS count FROM "Waste"')).rows[0].count).toBe(3);
            await expect(connection.query('INSERT INTO "SupplierMaterial" ("supplierId", "materialId", "coneWeightMode") VALUES ($1,$2,\'FIXED\')', [randomUUID(), randomUUID()])).rejects.toMatchObject({ code: '23514' });
            await connection.query('INSERT INTO "SupplierMaterial" ("supplierId", "materialId", "referenceConeWeightKg", "referenceRollTotalWeightKg", "referenceRollNetWeightKg") VALUES ($1,$2,0.3,10.3,10)', [randomUUID(), randomUUID()]);
            const materialId = randomUUID();
            await connection.query('INSERT INTO "Material" ("id", "name", "presentationId", "unitMeasureId", "base", "height") VALUES ($1,\'Material de origen\',$2,$2,1.5,50)', [materialId, randomUUID()]);
            await connection.query('UPDATE "Waste" SET "sourceMaterialId"=$1, "lengthSource"=\'ESTIMATED\', "referenceNetWeightKg"=10, "referenceLengthM"=50, "referenceWidthM"=1.5 WHERE "coneWeightKg" IS NOT NULL', [materialId]);
            const wastesBefore = (await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows;
            const offersBefore = (await connection.query('SELECT * FROM "SupplierMaterial" ORDER BY "id"')).rows;
            const simplification = readFileSync(new URL('../../../prisma/migrations/20261013190000_simplify_waste_material_reference/migration.sql', import.meta.url), 'utf8');
            await connection.query(simplification);
            const removedFields = ['referenceConeWeightKg', 'referenceConeWeightMode', 'coneWeightSource', 'referenceNetWeightKg', 'referenceLengthM', 'referenceWidthM'];
            expect((await connection.query('SELECT * FROM "Waste" ORDER BY "id"')).rows).toEqual(wastesBefore.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => !removedFields.includes(key)))));
            expect((await connection.query('SELECT * FROM "SupplierMaterial" ORDER BY "id"')).rows).toEqual(offersBefore.map(({ coneWeightMode, referenceRollNetWeightKg, ...row }) => row));

        } finally {
            await connection.end();
        }
    });
});
