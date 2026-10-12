import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migrationSql = name => readFileSync(new URL(`../../../prisma/migrations/${name}/migration.sql`, import.meta.url), 'utf8');
const migration = migrationSql('20261012180000_shorten_issue_and_purchase_reference_prefixes');
const tables = ['GoodsIssue', 'GoodsReceipt', 'WasteIssue', 'ReferenceNumberCounter'];

// Real columns, defaults and unique indexes, isolated from permanent test fixtures.
const withTables = async callback => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        for (const table of [...tables, 'WasteStockAdjustment']) {
            await connection.query(`CREATE TEMP TABLE "${table}" (LIKE public."${table}" INCLUDING ALL)`);
        }
        await callback(connection);
    } finally {
        await connection.end();
    }
};

const insertIssue = async (connection, table, referenceNumber, type = 'MATERIAL') => {
    const id = randomUUID();
    const fields = table === 'GoodsIssue' ? '"type"' : '"createdById"';
    const context = table === 'GoodsIssue' ? type : randomUUID();
    await connection.query(`INSERT INTO "${table}" (
        "id", "referenceNumber", ${fields}, "requestDate", "projectNumber",
        "departmentName", "requesterName", "clientName", "advisorName",
        "departmentId", "requesterId", "clientId", "advisorId", "statusId", "fulfillmentStatusId", "updatedAt"
    ) VALUES ($1, $2, $3, '2026-10-12', 'MIG-1', 'Área', 'Solicitante', 'Cliente', 'Asesor',
        $4, $4, $4, $4, $4, $4, '2026-10-12')`, [id, referenceNumber, context, randomUUID()]);
    return id;
};

const insertReceipt = async (connection, referenceNumber, type = 'MATERIAL') => {
    const id = randomUUID();
    await connection.query(`INSERT INTO "GoodsReceipt" (
        "id", "referenceNumber", "type", "supplierId", "supplierName", "statusId", "receivedById",
        "receivedByName", "receptionDate", "totalQuantity", "totalNetPurchaseAmount", "totalGrossPurchaseAmount", "updatedAt"
    ) VALUES ($1, $2, $3, $4, 'Proveedor', $4, $4, 'Recibe', '2026-10-12', 2, 20, 23.2, '2026-10-12')`,
    [id, referenceNumber, type, randomUUID()]);
    return id;
};

const snapshot = async connection => {
    const result = {};
    for (const table of tables) {
        result[table] = (await connection.query(`SELECT * FROM "${table}" ORDER BY "id"`)).rows;
    }
    return result;
};
const counter = async (connection, prefix, year = 2026) =>
    (await connection.query('SELECT "counter" FROM "ReferenceNumberCounter" WHERE "prefix" = $1 AND "year" = $2', [prefix, year])).rows[0]?.counter;

describe('migración incremental de cinco series cortas', () => {
    it('continúa la cadena histórica, conserva todos los campos y aísla el contador de merma', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SAL-2026-000007');
            await insertIssue(connection, 'GoodsIssue', 'SAL-2026-000008', 'CONSUMABLE');
            await insertReceipt(connection, 'REC-2026-000007');
            await insertReceipt(connection, 'REC-2026-000008', 'CONSUMABLE');
            await insertIssue(connection, 'WasteIssue', 'SM-2026-000007');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SAL', 2026, 20), ('REC', 2026, 30), ('SM', 2026, 9000), ('SMA', 2026, 40)`);

            await connection.query(migrationSql('20260814150000_align_waste_reference_prefixes'));
            await connection.query(migrationSql('20261012120000_split_goods_issue_reference_prefixes'));
            const before = await snapshot(connection);
            await connection.query(migration);
            const after = await snapshot(connection);
            for (const table of ['GoodsIssue', 'GoodsReceipt', 'WasteIssue']) {
                expect(after[table]).toEqual(before[table].map(row => ({
                    ...row,
                    referenceNumber: table === 'WasteIssue' ? 'SME-2026-000007'
                        : table === 'GoodsReceipt' ? `${row.type === 'CONSUMABLE' ? 'CCO' : 'CMA'}-2026-${row.type === 'CONSUMABLE' ? '000008' : '000007'}`
                            : `${row.type === 'CONSUMABLE' ? 'SCO' : 'SMA'}-2026-${row.type === 'CONSUMABLE' ? '000008' : '000007'}`
                })));
            }
            for (const [prefix, expected] of [['SMA', 40], ['SCO', 20], ['CMA', 30], ['CCO', 30], ['SME', 9000]]) {
                expect(await counter(connection, prefix)).toBe(expected);
            }
            await connection.query(migration);
            expect(await snapshot(connection)).toEqual(after);
        });
    });

    it('usa el tipo guardado para SAL y REC, y conserva años, sufijos largos y referencias personalizadas', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SAL-2025-000005');
            await insertIssue(connection, 'GoodsIssue', 'SAL-2026-1000001', 'CONSUMABLE');
            await insertReceipt(connection, 'REC-2025-000009');
            await insertReceipt(connection, 'REC-2026-1000002', 'CONSUMABLE');
            await insertIssue(connection, 'WasteIssue', 'SAL-MER-2026-1000003');
            await insertIssue(connection, 'GoodsIssue', 'SAL-MER-2026-000099');
            await insertReceipt(connection, 'REC-EXTERNO');
            await connection.query(migration);
            const after = await snapshot(connection);
            expect(after.GoodsIssue.map(row => row.referenceNumber)).toEqual(expect.arrayContaining([
                'SMA-2025-000005', 'SCO-2026-1000001', 'SAL-MER-2026-000099'
            ]));
            expect(after.GoodsReceipt.map(row => row.referenceNumber)).toEqual(expect.arrayContaining([
                'CMA-2025-000009', 'CCO-2026-1000002', 'REC-EXTERNO'
            ]));
            expect(await counter(connection, 'SMA', 2025)).toBe(5);
            expect(await counter(connection, 'CMA', 2025)).toBe(9);
            expect(await counter(connection, 'SCO')).toBe(1000001);
            expect(await counter(connection, 'CCO')).toBe(1000002);
            expect(await counter(connection, 'SME')).toBe(1000003);
        });
    });

    it.each(['GoodsIssue', 'GoodsReceipt', 'WasteIssue'])('revierte documentos y contadores de todas las series si colisiona %s', async table => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SAL-MAT-2026-000005');
            await insertReceipt(connection, 'REC-2026-000006');
            await insertIssue(connection, 'WasteIssue', 'SAL-MER-2026-000007');
            if (table === 'GoodsIssue') await insertIssue(connection, table, 'SMA-2026-000005');
            if (table === 'GoodsReceipt') await insertReceipt(connection, 'CMA-2026-000006');
            if (table === 'WasteIssue') await insertIssue(connection, table, 'SME-2026-000007');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES ('REC', 2026, 80)`);
            const before = await snapshot(connection);
            await expect(connection.query(migration)).rejects.toMatchObject({ code: '23505' });
            await connection.query('ROLLBACK');
            expect(await snapshot(connection)).toEqual(before);
        });
    });

    it('traslada contadores aunque no queden documentos y conserva los valores vigentes mayores', async () => {
        await withTables(async connection => {
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SAL-MAT', 2026, 80), ('SAL-CON', 2026, 50), ('REC', 2026, 30),
                ('SAL-MER', 2026, 9000), ('CCO', 2026, 100), ('SME', 2026, 10000)`);
            await connection.query(migration);
            for (const [prefix, expected] of [['SMA', 80], ['SCO', 50], ['CMA', 30], ['CCO', 100], ['SME', 10000]]) {
                expect(await counter(connection, prefix)).toBe(expected);
            }
            expect(await counter(connection, 'REC')).toBe(30);
            expect(await counter(connection, 'SAL-MER')).toBe(9000);
        });
    });

    it('admite una instalación vacía sin crear documentos ni contadores', async () => {
        await withTables(async connection => {
            const before = await snapshot(connection);
            await connection.query(migration);
            expect(await snapshot(connection)).toEqual(before);
        });
    });
});
