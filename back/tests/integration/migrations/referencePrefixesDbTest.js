import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migrationSql = name => readFileSync(new URL(`../../../prisma/migrations/${name}/migration.sql`, import.meta.url), 'utf8');
const migration = migrationSql('20261012180000_shorten_issue_and_purchase_reference_prefixes');
const tables = ['GoodsIssue', 'GoodsReceipt', 'WasteIssue', 'ReferenceNumberCounter'];

// Real columns, defaults and unique indexes, isolated from permanent test fixtures.
const withTables = async (callback, tableNames = [...tables, 'WasteStockAdjustment']) => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        for (const table of tableNames) {
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

const snapshot = async (connection, tableNames = tables) => {
    const result = {};
    for (const table of tableNames) {
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

const counterRepair = migrationSql('20261104120000_repair_independent_goods_reference_counters');

describe('reconciliación de contadores con el último folio de cada documento', () => {
    it('corrige la herencia SAL/REC y deja en cero las series sin documentos, sin renumerar historia', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SAL-2026-000015');
            await insertReceipt(connection, 'REC-2026-000027');
            await insertIssue(connection, 'WasteIssue', 'SME-2026-000070');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SAL', 2026, 15), ('REC', 2026, 27), ('SME', 2026, 70)`);
            await connection.query(migrationSql('20261012120000_split_goods_issue_reference_prefixes'));
            await connection.query(migration);
            expect(await counter(connection, 'SCO')).toBe(15);
            expect(await counter(connection, 'CCO')).toBe(27);
            const before = await snapshot(connection);

            await connection.query(counterRepair);

            for (const table of ['GoodsIssue', 'GoodsReceipt', 'WasteIssue']) {
                expect((await snapshot(connection))[table]).toEqual(before[table]);
            }
            for (const [prefix, expected] of [['SMA', 15], ['SCO', 0], ['CMA', 27], ['CCO', 0]]) {
                expect(await counter(connection, prefix)).toBe(expected);
            }
            const after = await snapshot(connection);
            for (const row of before.ReferenceNumberCounter) {
                if (['SAL', 'REC', 'SAL-MAT', 'SAL-CON'].includes(row.prefix)) {
                    expect(after.ReferenceNumberCounter.find(item => item.id === row.id)).toBeUndefined();
                    continue;
                }
                expect(after.ReferenceNumberCounter.find(item => item.id === row.id)).toEqual({
                    ...row,
                    counter: ({ SCO: 0, CCO: 0 })[row.prefix] ?? row.counter
                });
            }
            await connection.query(counterRepair);
            expect(await snapshot(connection)).toEqual(after);
        });
    });

    it('usa el máximo numérico propio, no la cantidad de documentos, su fecha de edición ni otro contador', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SMA-2026-000099');
            const last = await insertIssue(connection, 'GoodsIssue', 'SCO-2026-000011', 'CONSUMABLE');
            const edited = await insertIssue(connection, 'GoodsIssue', 'SCO-2026-000002', 'CONSUMABLE');
            await connection.query('UPDATE "GoodsIssue" SET "updatedAt" = $1 WHERE "id" = $2', ['2026-11-04', edited]);
            await insertReceipt(connection, 'CMA-2026-000080');
            await insertReceipt(connection, 'CCO-2026-000009', 'CONSUMABLE');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SMA', 2026, 500), ('SCO', 2026, 500), ('CMA', 2026, 700), ('CCO', 2026, 700),
                ('SAL', 2026, 800), ('SAL-CON', 2026, 600), ('REC', 2026, 900)`);
            const before = await snapshot(connection);

            await connection.query(counterRepair);

            for (const [prefix, expected] of [['SMA', 99], ['SCO', 11], ['CMA', 80], ['CCO', 9]]) {
                expect(await counter(connection, prefix)).toBe(expected);
            }
            expect((await snapshot(connection)).GoodsIssue).toEqual(before.GoodsIssue);
            expect((await snapshot(connection)).GoodsReceipt).toEqual(before.GoodsReceipt);
            expect(before.GoodsIssue.find(row => row.id === last).referenceNumber).toBe('SCO-2026-000011');
            expect(await counter(connection, 'SAL')).toBeUndefined();
            expect(await counter(connection, 'SAL-CON')).toBeUndefined();
            expect(await counter(connection, 'REC')).toBeUndefined();
        });
    });

    it('nunca baja de un folio ya emitido y protege sus referencias aunque cambie la clasificación', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SCO-2026-1000001', 'MATERIAL');
            await insertReceipt(connection, 'CCO-2026-1000002', 'MATERIAL');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SCO', 2026, 20), ('CCO', 2026, 30)`);
            const before = await snapshot(connection);
            await connection.query(counterRepair);
            expect(await counter(connection, 'SCO')).toBe(1000001);
            expect(await counter(connection, 'CCO')).toBe(1000002);
            expect((await snapshot(connection)).GoodsIssue).toEqual(before.GoodsIssue);
            expect((await snapshot(connection)).GoodsReceipt).toEqual(before.GoodsReceipt);
        });
    });

    it('crea sólo contadores necesarios y conserva año cero, proveedores, merma, ajustes y referencias externas', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SMA-2025-000005');
            await insertReceipt(connection, 'CCO-2026-000003', 'CONSUMABLE');
            await insertReceipt(connection, 'COMPRA-EXTERNA');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SMA', 0, 999), ('SMA', 2026, 90), ('CCO', 2025, 80),
                ('SME', 2026, 5000), ('AME', 2026, 6000), ('EME', 2026, 7000), ('AJU', 2026, 8000), ('PRO', 0, 40)`);
            const before = await snapshot(connection);
            await connection.query(counterRepair);
            expect(await counter(connection, 'SMA', 2025)).toBe(5);
            expect(await counter(connection, 'SMA', 2026)).toBe(0);
            expect(await counter(connection, 'CCO', 2025)).toBe(0);
            expect(await counter(connection, 'CCO', 2026)).toBe(3);
            expect(await counter(connection, 'SCO')).toBeUndefined();
            expect(await counter(connection, 'CMA')).toBeUndefined();
            const after = await snapshot(connection);
            for (const row of before.ReferenceNumberCounter.filter(row => row.year === 0 || ['SME', 'AME', 'EME', 'AJU'].includes(row.prefix))) {
                expect(after.ReferenceNumberCounter.find(item => item.id === row.id)).toEqual(row);
            }
            expect(after.GoodsIssue).toEqual(before.GoodsIssue);
            expect(after.GoodsReceipt).toEqual(before.GoodsReceipt);
        });
    });

    it('retira todos los prefijos no registrados aunque tengan tres letras y conserva las nueve series vigentes', async () => {
        await withTables(async connection => {
            const active = ['SMA', 'SCO', 'SME', 'CMA', 'CCO', 'AJU', 'AME', 'EME', 'PRO'];
            const retired = ['SAL', 'REC', 'SAL-MAT', 'SAL-CON', 'SM', 'SAL-MER', 'AJU-MER', 'ENT-MER', 'REQ', 'OLD'];
            for (const prefix of [...active, ...retired]) {
                await connection.query('INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES ($1, $2, 50)',
                    [prefix, prefix === 'PRO' ? 0 : 2026]);
            }
            const before = await snapshot(connection);
            await connection.query(counterRepair);
            const after = await snapshot(connection);
            expect(after.ReferenceNumberCounter.map(row => row.prefix).sort()).toEqual([...active].sort());
            for (const row of before.ReferenceNumberCounter.filter(row => active.includes(row.prefix))) {
                expect(after.ReferenceNumberCounter.find(item => item.prefix === row.prefix).id).toBe(row.id);
            }
            expect(after.GoodsIssue).toEqual(before.GoodsIssue);
            expect(after.GoodsReceipt).toEqual(before.GoodsReceipt);
        });
    });

    it('revierte todos los contadores si falla una escritura de la reconciliación', async () => {
        await withTables(async connection => {
            await insertIssue(connection, 'GoodsIssue', 'SMA-2026-000005');
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SMA', 2026, 80), ('SCO', 2026, 80)`);
            await connection.query('ALTER TABLE "ReferenceNumberCounter" ADD CONSTRAINT positive_counter_for_test CHECK ("counter" > 0)');
            const before = await snapshot(connection);
            await expect(connection.query(counterRepair)).rejects.toMatchObject({ code: '23514' });
            await connection.query('ROLLBACK');
            expect(await snapshot(connection)).toEqual(before);
        });
    });

    it('no crea contadores en una instalación vacía', async () => {
        await withTables(async connection => {
            const before = await snapshot(connection);
            await connection.query(counterRepair);
            expect(await snapshot(connection)).toEqual(before);
        });
    });
});

const wasteMigration = migrationSql('20261016120000_normalize_waste_stock_reference_prefixes');
const wasteTables = ['WasteStockAdjustment', 'WasteStockEntry', 'WasteMovement',
    'WasteStockAdjustmentDetail', 'WasteMovementDetail', 'ReferenceNumberCounter'];

const insertWasteDocument = async (connection, table, referenceNumber, { movementId = randomUUID(), movementType = 'ENTRY' } = {}) => {
    const id = randomUUID();
    const actor = randomUUID();
    if (table === 'WasteMovement') {
        await connection.query(`INSERT INTO "WasteMovement" ("id", "referenceNumber", "type", "updatedAt")
            VALUES ($1, $2, $3, '2026-10-16')`, [id, referenceNumber, movementType]);
    } else if (table === 'WasteStockAdjustment') {
        await connection.query(`INSERT INTO "WasteStockAdjustment"
            ("id", "referenceNumber", "type", "status", "reasonId", "createdById", "approvedById", "wasteMovementId", "updatedAt")
            VALUES ($1, $2, 'INCREASE', 'APPLIED', $3, $3, $3, $4, '2026-10-16')`, [id, referenceNumber, actor, movementId]);
    } else {
        await connection.query(`INSERT INTO "WasteStockEntry"
            ("id", "referenceNumber", "wasteId", "createdById", "wasteMovementId", "materialName", "quantity", "previousStock", "newStock", "updatedAt")
            VALUES ($1, $2, $3, $3, $4, 'Merma histórica', 2, 3, 5, '2026-10-16')`, [id, referenceNumber, actor, movementId]);
    }
    return id;
};

describe('migración de entradas y ajustes de merma a EME y AME', () => {
    it('normaliza folios, conserva naturaleza, relaciones y saldos y continúa cada serie anual', async () => {
        await withTables(async connection => {
            const movementId = await insertWasteDocument(connection, 'WasteMovement', null, { movementType: 'ADJUSTMENT' });
            const adjustmentId = await insertWasteDocument(connection, 'WasteStockAdjustment', 'AJU-MER-2026-0007', { movementId });
            await insertWasteDocument(connection, 'WasteStockAdjustment', 'AME-2026-000004');
            await insertWasteDocument(connection, 'WasteStockEntry', 'ENT-MER-2026-1000001');
            await insertWasteDocument(connection, 'WasteStockEntry', 'REFERENCIA-EXTERNA');
            await insertWasteDocument(connection, 'WasteMovement', 'ENT-MER-2025-0008');
            await insertWasteDocument(connection, 'WasteMovement', 'AJU-MER-2026-000120', { movementType: 'ADJUSTMENT' });
            const detailId = randomUUID();
            const wasteId = randomUUID();
            await connection.query(`INSERT INTO "WasteStockAdjustmentDetail"
                ("id", "wasteStockAdjustmentId", "wasteId", "materialName", "previousStock", "newStock", "difference",
                 "previousConvertedQuantity", "newConvertedQuantity", "convertedDifference")
                VALUES ($1, $2, $3, 'Merma histórica', 0, 5, 5, 0, 30, 30)`, [detailId, adjustmentId, wasteId]);
            await connection.query(`INSERT INTO "WasteMovementDetail"
                ("id", "wasteId", "movementId", "wasteStockAdjustmentDetailId", "quantity", "previousStock", "newStock", "updatedAt")
                VALUES ($1, $2, $3, $4, 5, 0, 5, '2026-10-16')`, [randomUUID(), wasteId, movementId, detailId]);
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('AJU-MER', 2026, 80), ('AME', 2026, 100), ('ENT-MER', 2026, 90), ('SME', 2026, 999)`);
            const before = await snapshot(connection, wasteTables);

            await connection.query(wasteMigration);
            const after = await snapshot(connection, wasteTables);
            for (const table of wasteTables.filter(name => name !== 'ReferenceNumberCounter')) {
                expect(after[table]).toEqual(before[table].map(row => ({ ...row,
                    ...('referenceNumber' in row && { referenceNumber: row.referenceNumber?.replace(
                        /^(AJU-MER|ENT-MER)-(\d{4})-(\d+)$/,
                        (_, prefix, year, number) => `${prefix === 'AJU-MER' ? 'AME' : 'EME'}-${year}-${number.padStart(6, '0')}`
                    ) ?? null })
                })));
            }
            expect(await counter(connection, 'AME')).toBe(120);
            expect(await counter(connection, 'EME')).toBe(1000001);
            expect(await counter(connection, 'EME', 2025)).toBe(8);
            expect(await counter(connection, 'AJU-MER')).toBe(80);
            expect(await counter(connection, 'SME')).toBe(999);
            await connection.query(wasteMigration);
            expect(await snapshot(connection, wasteTables)).toEqual(after);
        }, wasteTables);
    });

    it('conserva contadores mayores y traslada años sin documentos', async () => {
        await withTables(async connection => {
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('AJU-MER', 2026, 80), ('AME', 2026, 100), ('ENT-MER', 2025, 90), ('EME', 2025, 110),
                ('ENT-MER', 2027, 50), ('AJU-MER', 2025, 40)`);
            await connection.query(wasteMigration);
            expect(await counter(connection, 'AME')).toBe(100);
            expect(await counter(connection, 'AME', 2025)).toBe(40);
            expect(await counter(connection, 'EME', 2025)).toBe(110);
            expect(await counter(connection, 'EME', 2027)).toBe(50);
        }, wasteTables);
    });

    it.each(['WasteStockAdjustment', 'WasteStockEntry', 'WasteMovement'])('revierte toda la migración si hay colisión en %s', async table => {
        await withTables(async connection => {
            await insertWasteDocument(connection, 'WasteStockAdjustment', 'AJU-MER-2026-000003');
            await insertWasteDocument(connection, 'WasteStockEntry', 'ENT-MER-2026-000004');
            const legacy = table === 'WasteStockAdjustment' ? 'AJU-MER' : 'ENT-MER';
            const current = table === 'WasteStockAdjustment' ? 'AME' : 'EME';
            await insertWasteDocument(connection, table, `${legacy}-2026-1`);
            await insertWasteDocument(connection, table, `${current}-2026-000001`);
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES ('ENT-MER', 2026, 80)`);
            const before = await snapshot(connection, wasteTables);
            await expect(connection.query(wasteMigration)).rejects.toMatchObject({ code: '23505' });
            await connection.query('ROLLBACK');
            expect(await snapshot(connection, wasteTables)).toEqual(before);
        }, wasteTables);
    });

    it('no crea documentos ni contadores en una instalación vacía', async () => {
        await withTables(async connection => {
            const before = await snapshot(connection, wasteTables);
            await connection.query(wasteMigration);
            expect(await snapshot(connection, wasteTables)).toEqual(before);
        }, wasteTables);
    });
});
