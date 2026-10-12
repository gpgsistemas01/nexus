import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { ROLE_NAMES } from '../../../src/constants/roles.js';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const suffix = Math.random().toString(36).slice(2, 8);
const ids = {};
const issues = {};
let app;
let prisma;
const reportFinders = {};
const issuePath = resource => `/goods-issues/${resource === 'consumable' ? 'consumables' : 'materials'}`;

const header = () => ({
    requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client,
    departmentId: ids.department, projectNumber: 'CTX-100',
    requestDate: '2026-10-07T12:30:00.000Z', observations: 'Salida aislada por contexto'
});
const detail = resource => ({ materialId: ids[resource], supplierId: ids.supplier, quantity: 2 });
const createIssue = resource => request(app).post(issuePath(resource)).send({ ...header(), details: [detail(resource)] });
const folioMigration = readFileSync(new URL(
    '../../../prisma/migrations/20261012120000_split_goods_issue_reference_prefixes/migration.sql', import.meta.url
), 'utf8');

// Temporary tables copy the real PostgreSQL columns, defaults and unique indexes.
// Migration SQL runs unchanged while permanent fixtures remain untouched.
const withFolioMigrationTables = async callback => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        await connection.query(`
            CREATE TEMP TABLE "GoodsIssue" (LIKE public."GoodsIssue" INCLUDING ALL);
            CREATE TEMP TABLE "ReferenceNumberCounter" (LIKE public."ReferenceNumberCounter" INCLUDING ALL);
            CREATE TEMP TABLE "WasteIssue" (LIKE public."WasteIssue" INCLUDING ALL);
            CREATE TEMP TABLE "WasteStockAdjustment" (LIKE public."WasteStockAdjustment" INCLUDING ALL);
        `);
        await connection.query(
            'INSERT INTO "GoodsIssue" SELECT * FROM public."GoodsIssue" WHERE "id" = ANY($1::uuid[])',
            [[issues.material.id, issues.consumable.id]]
        );
        await callback(connection);
    } finally {
        await connection.end();
    }
};

const getIssueCounter = prefix => prisma.referenceNumberCounter.findUnique({
    where: { prefix_year: { prefix, year: new Date().getFullYear() } }
});

const cleanCreatedRecords = async () => {
    if (!prisma || !ids.department) return;
    const rows = await prisma.goodsIssue.findMany({ where: { departmentId: ids.department }, select: { id: true } });
    const issueIds = rows.map(row => row.id);
    const movements = await prisma.inventoryMovement.findMany({ where: { goodsIssueId: { in: issueIds } }, select: { id: true } });
    await prisma.goodsIssueReturn.deleteMany({ where: { goodsIssueId: { in: issueIds } } });
    await prisma.movementDetail.deleteMany({ where: { movementId: { in: movements.map(row => row.id) } } });
    await prisma.inventoryMovement.deleteMany({ where: { goodsIssueId: { in: issueIds } } });
    await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssueId: { in: issueIds } } });
    await prisma.goodsIssue.deleteMany({ where: { id: { in: issueIds } } });
    await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
    await prisma.material.deleteMany({ where: { id: { in: [ids.material, ids.consumable] } } });
    await prisma.supplier.delete({ where: { id: ids.supplier } });
    await prisma.client.delete({ where: { id: ids.client } });
    await prisma.person.deleteMany({ where: { id: { in: [ids.requester, ids.advisor] } } });
    await prisma.department.delete({ where: { id: ids.department } });
    await prisma.presentation.delete({ where: { id: ids.presentation } });
    await prisma.unitMeasure.delete({ where: { id: ids.unit } });
};

describe('aislamiento HTTP y persistencia de salidas de materiales y consumibles', () => {
    beforeAll(async () => {
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        const controllers = {
            material: await import('../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js'),
            consumable: await import('../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js')
        };
        reportFinders.material = (await import('../../../src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js')).findMaterialGoodsIssueReportRows;
        reportFinders.consumable = (await import('../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js')).findConsumableGoodsIssueReportRows;
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => {
                req.user = { accesses: [{ role: ROLE_NAMES.SYSTEM_ADMIN }] };
                next();
            });
            for (const [resource, label] of [['material', 'Material'], ['consumable', 'Consumable']]) {
                const path = issuePath(resource);
                const controller = controllers[resource];
                router.get(path, controller[`getAll${label}GoodsIssues`]);
                router.post(path, controller[`register${label}GoodsIssue`]);
                router.patch(`${path}/:id`, controller[`edit${label}GoodsIssue`]);
                router.patch(`${path}/:id/header`, controller[`edit${label}GoodsIssueHeader`]);
                router.patch(`${path}/:id/details`, controller[`edit${label}GoodsIssueDetails`]);
                router.patch(`${path}/:id/details/:detailId/returns`, controller[`register${label}GoodsIssueDetailReturn`]);
            }
        } });
        for (const name of ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado']) {
            await prisma.fulfillmentStatus.upsert({ where: { name }, update: {}, create: { name } });
        }
        for (const name of ['Aprobada', 'Cancelada']) {
            await prisma.status.upsert({ where: { name }, update: {}, create: { name } });
        }
        ids.unit = (await prisma.unitMeasure.create({ data: { name: `IT GI Unit ${suffix}`, symbol: `g${suffix}` } })).id;
        ids.presentation = (await prisma.presentation.create({ data: { name: `IT GI Presentation ${suffix}` } })).id;
        ids.supplier = (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `GI${suffix}`,
            legalName: `IT GI Legal ${suffix}`, tradeName: `IT GI Supplier ${suffix}`
        } })).id;
        for (const [resource, type] of [['material', 'MATERIAL'], ['consumable', 'CONSUMABLE']]) {
            ids[resource] = (await prisma.material.create({ data: {
                name: `IT GI ${resource} ${suffix}`, type, presentationId: ids.presentation, unitMeasureId: ids.unit
            } })).id;
            await prisma.supplierMaterial.create({ data: {
                materialId: ids[resource], supplierId: ids.supplier, maxUnitCost: 10,
                currentStock: 10, convertedQuantity: 10
            } });
        }
        ids.department = (await prisma.department.create({ data: { name: `IT GI Area ${suffix}` } })).id;
        ids.requester = (await prisma.person.create({ data: { fullName: `IT GI Requester ${suffix}` } })).id;
        ids.advisor = (await prisma.person.create({ data: { fullName: `IT GI Advisor ${suffix}` } })).id;
        ids.client = (await prisma.client.create({ data: { name: `IT GI Client ${suffix}`, advisorId: ids.advisor } })).id;
        for (const resource of ['material', 'consumable']) {
            const response = await createIssue(resource).expect(200);
            issues[resource] = response.body.goodsIssue;
            expect(issues[resource].type).toBe(resource === 'consumable' ? 'CONSUMABLE' : 'MATERIAL');
            expect(issues[resource].referenceNumber).toMatch(
                new RegExp(`^SAL-${resource === 'consumable' ? 'CON' : 'MAT'}-${new Date().getFullYear()}-\\d{6,}$`)
            );
            expect((await prisma.goodsIssue.findUnique({ where: { id: issues[resource].id } })).type)
                .toBe(issues[resource].type);
        }
        const { id, details, createdAt, updatedAt, ...mixedData } = await prisma.goodsIssue.findUnique({
            where: { id: issues.material.id }, include: { details: true }
        });
        issues.mixed = await prisma.goodsIssue.create({ data: {
            ...mixedData, referenceNumber: `IT-GI-MIX-${suffix}`,
            details: { create: ['material', 'consumable'].map(resource => ({
                materialId: ids[resource], supplierId: ids.supplier,
                materialName: `IT GI ${resource} ${suffix}`, quantity: 2, convertedQuantity: 2,
                maxUnitCost: 10, fulfillmentStatusId: details[0].fulfillmentStatusId
            })) }
        } });
    });

    afterAll(cleanCreatedRecords);

    it('clasifica las salidas históricas con la misma regla de la migración de compras', async () => {
        await prisma.goodsIssue.updateMany({ where: { departmentId: ids.department }, data: { type: 'MATERIAL' } });
        const migration = readFileSync(new URL('../../../prisma/migrations/20261007000000_add_goods_issue_type/migration.sql', import.meta.url), 'utf8');
        await prisma.$executeRawUnsafe(migration.split(';')[1]);
        expect((await prisma.goodsIssue.findUnique({ where: { id: issues.material.id } })).type).toBe('MATERIAL');
        expect((await prisma.goodsIssue.findUnique({ where: { id: issues.consumable.id } })).type).toBe('CONSUMABLE');
        expect((await prisma.goodsIssue.findUnique({ where: { id: issues.mixed.id } })).type).toBe('MATERIAL');
    });

    it('convierte los folios legados por tipo, conserva sus datos y no disminuye contadores al repetirse', async () => {
        await withFolioMigrationTables(async connection => {
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2025-000005', issues.material.id]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000008', issues.consumable.id]);
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SAL', 2025, 12), ('SAL', 2026, 20), ('SAL-MAT', 2026, 40), ('SAL-MER', 2026, 9), ('REC', 2026, 6)`);
            const before = (await connection.query('SELECT * FROM "GoodsIssue" ORDER BY "id"')).rows;

            await connection.query(folioMigration);

            const after = (await connection.query('SELECT * FROM "GoodsIssue" ORDER BY "id"')).rows;
            expect(after).toEqual(before.map(row => ({
                ...row, referenceNumber: row.type === 'CONSUMABLE' ? 'SAL-CON-2026-000008' : 'SAL-MAT-2025-000005'
            })));
            const counters = (await connection.query('SELECT "prefix", "year", "counter" FROM "ReferenceNumberCounter" ORDER BY "prefix", "year"')).rows;
            expect(counters).toEqual(expect.arrayContaining([
                { prefix: 'SAL-MAT', year: 2025, counter: 12 },
                { prefix: 'SAL-CON', year: 2025, counter: 12 },
                { prefix: 'SAL-MAT', year: 2026, counter: 40 },
                { prefix: 'SAL-CON', year: 2026, counter: 20 },
                { prefix: 'SAL', year: 2026, counter: 20 },
                { prefix: 'SAL-MER', year: 2026, counter: 9 },
                { prefix: 'REC', year: 2026, counter: 6 }
            ]));

            await connection.query(folioMigration);
            expect((await connection.query('SELECT * FROM "GoodsIssue" ORDER BY "id"')).rows).toEqual(after);
            expect((await connection.query('SELECT "prefix", "year", "counter" FROM "ReferenceNumberCounter" ORDER BY "prefix", "year"')).rows).toEqual(counters);
        });
    });

    it('usa los máximos emitidos cuando no existe el contador anterior y conserva referencias personalizadas', async () => {
        await withFolioMigrationTables(async connection => {
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-1000000', issues.material.id]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['IT-CUSTOM-CONSUMABLE', issues.consumable.id]);

            await connection.query(folioMigration);

            const material = (await connection.query('SELECT "referenceNumber" FROM "GoodsIssue" WHERE "id" = $1', [issues.material.id])).rows[0];
            const consumable = (await connection.query('SELECT "referenceNumber" FROM "GoodsIssue" WHERE "id" = $1', [issues.consumable.id])).rows[0];
            expect(material.referenceNumber).toBe('SAL-MAT-2026-1000000');
            expect(consumable.referenceNumber).toBe('IT-CUSTOM-CONSUMABLE');
            expect((await connection.query('SELECT "prefix", "year", "counter" FROM "ReferenceNumberCounter"')).rows)
                .toEqual([{ prefix: 'SAL-MAT', year: 2026, counter: 1000000 }]);
        });
    });

    it('revierte toda la conversión si el folio destino ya existe', async () => {
        await withFolioMigrationTables(async connection => {
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000005', issues.material.id]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000008', issues.consumable.id]);
            const original = (await connection.query('SELECT * FROM "GoodsIssue" WHERE "id" = $1', [issues.material.id])).rows[0];
            await connection.query('INSERT INTO "GoodsIssue" SELECT * FROM jsonb_populate_record(NULL::"GoodsIssue", $1::jsonb)', [
                JSON.stringify({ ...original, id: randomUUID(), referenceNumber: 'SAL-MAT-2026-000005' })
            ]);
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES ('SAL', 2026, 20)`);
            const before = (await connection.query('SELECT * FROM "GoodsIssue" ORDER BY "id"')).rows;

            await expect(connection.query(folioMigration)).rejects.toMatchObject({ code: '23505' });
            await connection.query('ROLLBACK');

            expect((await connection.query('SELECT * FROM "GoodsIssue" ORDER BY "id"')).rows).toEqual(before);
            expect((await connection.query('SELECT "prefix", "year", "counter" FROM "ReferenceNumberCounter"')).rows)
                .toEqual([{ prefix: 'SAL', year: 2026, counter: 20 }]);
        });
    });

    it('admite una instalación nueva sin salidas ni contadores', async () => {
        await withFolioMigrationTables(async connection => {
            await connection.query('DELETE FROM "GoodsIssue"');
            await connection.query(folioMigration);
            expect((await connection.query('SELECT * FROM "GoodsIssue"')).rows).toEqual([]);
            expect((await connection.query('SELECT * FROM "ReferenceNumberCounter"')).rows).toEqual([]);
        });
    });

    it('conserva las salidas SAL-MER y su contador sin incorporarlos a las series de artículos', async () => {
        await withFolioMigrationTables(async connection => {
            const source = (await connection.query('SELECT * FROM "GoodsIssue" WHERE "id" = $1', [issues.material.id])).rows[0];
            await connection.query('INSERT INTO "WasteIssue" SELECT * FROM jsonb_populate_record(NULL::"WasteIssue", $1::jsonb)', [
                JSON.stringify({ ...source, id: randomUUID(), createdById: randomUUID(), referenceNumber: 'SAL-MER-2026-005000' })
            ]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000005', issues.material.id]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000008', issues.consumable.id]);
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SAL', 2026, 10), ('SAL-MER', 2026, 6000)`);
            const wastes = (await connection.query('SELECT * FROM "WasteIssue"')).rows;

            await connection.query(folioMigration);

            expect((await connection.query('SELECT * FROM "WasteIssue"')).rows).toEqual(wastes);
            expect((await connection.query('SELECT "prefix", "year", "counter" FROM "ReferenceNumberCounter" WHERE "prefix" = $1', ['SAL-MER'])).rows)
                .toEqual([{ prefix: 'SAL-MER', year: 2026, counter: 6000 }]);
            expect((await connection.query('SELECT "prefix", "counter" FROM "ReferenceNumberCounter" WHERE "prefix" IN ($1, $2) ORDER BY "prefix"', ['SAL-MAT', 'SAL-CON'])).rows)
                .toEqual([{ prefix: 'SAL-CON', counter: 10 }, { prefix: 'SAL-MAT', counter: 10 }]);
        });
    });

    it('respeta la distinción de merma después de la migración histórica SM a SAL-MER', async () => {
        await withFolioMigrationTables(async connection => {
            const source = (await connection.query('SELECT * FROM "GoodsIssue" WHERE "id" = $1', [issues.material.id])).rows[0];
            await connection.query('INSERT INTO "WasteIssue" SELECT * FROM jsonb_populate_record(NULL::"WasteIssue", $1::jsonb)', [
                JSON.stringify({ ...source, id: randomUUID(), createdById: randomUUID(), referenceNumber: 'SM-2026-000007' })
            ]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000007', issues.material.id]);
            await connection.query('UPDATE "GoodsIssue" SET "referenceNumber" = $1 WHERE "id" = $2', ['SAL-2026-000008', issues.consumable.id]);
            await connection.query(`INSERT INTO "ReferenceNumberCounter" ("prefix", "year", "counter") VALUES
                ('SM', 2026, 9), ('SAL', 2026, 10)`);
            const wasteMigration = readFileSync(new URL(
                '../../../prisma/migrations/20260814150000_align_waste_reference_prefixes/migration.sql', import.meta.url
            ), 'utf8');

            await connection.query(wasteMigration);
            const convertedWaste = (await connection.query('SELECT * FROM "WasteIssue"')).rows;
            await connection.query(folioMigration);

            expect(convertedWaste[0].referenceNumber).toBe('SAL-MER-2026-000007');
            expect((await connection.query('SELECT * FROM "WasteIssue"')).rows).toEqual(convertedWaste);
            expect((await connection.query('SELECT "prefix", "year", "counter" FROM "ReferenceNumberCounter" WHERE "prefix" = $1', ['SAL-MER'])).rows)
                .toEqual([{ prefix: 'SAL-MER', year: 2026, counter: 9 }]);
            expect((await connection.query('SELECT "prefix" FROM "ReferenceNumberCounter" WHERE "prefix" = $1', ['SM'])).rows).toEqual([]);
            expect((await connection.query('SELECT "referenceNumber" FROM "GoodsIssue" ORDER BY "referenceNumber"')).rows)
                .toEqual([{ referenceNumber: 'SAL-CON-2026-000008' }, { referenceNumber: 'SAL-MAT-2026-000007' }]);
        });
    });

    it.each(['material', 'consumable'])('lista y exporta exclusivamente salidas del contexto %s', async inventoryResource => {
        const response = await request(app).get(issuePath(inventoryResource))
            .query({ departmentId: ids.department }).expect(200);
        expect(response.body.data.map(row => row.id)).toEqual([issues[inventoryResource].id]);
        expect(response.body.recordsTotal).toBe(1);
        const rows = await reportFinders[inventoryResource]({
            departmentId: ids.department, accesses: [{ role: ROLE_NAMES.SYSTEM_ADMIN }]
        });
        expect(rows).toHaveLength(1);
        expect(rows[0].referenceNumber).toBe(issues[inventoryResource].referenceNumber);
    });

    it('fija el contexto desde la ruta e ignora intentos de cambiarlo por query', async () => {
        const response = await request(app).get(issuePath('material'))
            .query({ departmentId: ids.department, inventoryResource: 'consumable', type: 'CONSUMABLE' }).expect(200);
        expect(response.body.data.map(row => row.id)).toEqual([issues.material.id]);
        expect(response.body.data[0].type).toBe('MATERIAL');
    });

    it.each(['material', 'consumable'])('rechaza altas mixtas en %s sin persistencia parcial', async inventoryResource => {
        const count = await prisma.goodsIssue.count({ where: { departmentId: ids.department } });
        const response = await request(app).post(issuePath(inventoryResource))
            .send({ ...header(), details: [detail('material'), detail('consumable')] }).expect(404);
        expect(response.body.code).toBe('MATERIAL_NOT_FOUND');
        expect(await prisma.goodsIssue.count({ where: { departmentId: ids.department } })).toBe(count);
    });

    it.each(['material', 'consumable'])('bloquea edición, encabezado, surtido y devolución cruzados desde %s', async inventoryResource => {
        const other = inventoryResource === 'material' ? 'consumable' : 'material';
        const issue = issues[other];
        const before = await prisma.goodsIssue.findUnique({ where: { id: issue.id }, include: { details: true } });
        const stockBefore = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier } });
        for (const [path, body] of [
            ['', { ...header(), details: [detail(inventoryResource)] }],
            ['/header', header()],
            ['/details', { details: [{ id: issue.details[0].id, isSupplied: true, projectConvertedQuantity: 2 }] }],
            [`/details/${issue.details[0].id}/returns`, { returnQuantity: 1 }]
        ]) {
            await request(app).patch(`${issuePath(inventoryResource)}/${issue.id}${path}`).send(body).expect(404);
        }
        expect(await prisma.goodsIssue.findUnique({ where: { id: issue.id }, include: { details: true } })).toEqual(before);
        expect(await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier } })).toEqual(stockBefore);
        expect(await prisma.inventoryMovement.count({ where: { goodsIssueId: issue.id } })).toBe(0);
        expect(await prisma.goodsIssueReturn.count({ where: { goodsIssueId: issue.id } })).toBe(0);
    });

    it.each(['material', 'consumable'])('rechaza reemplazar detalles de %s por el otro tipo', async inventoryResource => {
        const issue = issues[inventoryResource];
        const other = inventoryResource === 'material' ? 'consumable' : 'material';
        const before = await prisma.goodsIssueDetail.findMany({ where: { goodsIssueId: issue.id } });
        await request(app).patch(`${issuePath(inventoryResource)}/${issue.id}`)
            .send({ ...header(), details: [detail(other)] }).expect(404);
        expect(await prisma.goodsIssueDetail.findMany({ where: { goodsIssueId: issue.id } })).toEqual(before);
    });

    it.each(['material', 'consumable'])('permite editar, surtir y devolver dentro de %s', async inventoryResource => {
        const created = await createIssue(inventoryResource).expect(200);
        const issue = created.body.goodsIssue;
        const edited = await request(app).patch(`${issuePath(inventoryResource)}/${issue.id}`)
            .send({ ...header(), observations: 'Editada en su contexto', details: [detail(inventoryResource)] }).expect(200);
        const detailId = edited.body.goodsIssue.details[0].id;
        await request(app).patch(`${issuePath(inventoryResource)}/${issue.id}/header`)
            .send({ ...header(), observations: 'Encabezado actualizado' }).expect(200);
        await request(app).patch(`${issuePath(inventoryResource)}/${issue.id}/details`)
            .send({ details: [{ id: detailId, isSupplied: true, projectConvertedQuantity: 2 }] }).expect(200);
        const offerWhere = { supplierId_materialId: { materialId: ids[inventoryResource], supplierId: ids.supplier } };
        expect(Number((await prisma.supplierMaterial.findUnique({ where: offerWhere })).currentStock)).toBe(8);
        await request(app).patch(`${issuePath(inventoryResource)}/${issue.id}/details/${detailId}/returns`)
            .send({ returnQuantity: 1 }).expect(200);
        expect(Number((await prisma.supplierMaterial.findUnique({ where: offerWhere })).currentStock)).toBe(9);
        const persisted = await prisma.goodsIssueDetail.findUnique({ where: { id: detailId } });
        expect(Number(persisted.suppliedQuantity)).toBe(2);
        expect(Number(persisted.returnedQuantity)).toBe(1);
        expect(await prisma.inventoryMovement.count({ where: { goodsIssueId: issue.id } })).toBe(2);
    });
    it('genera consecutivos independientes por tipo incluso con altas concurrentes', async () => {
        const before = { material: await getIssueCounter('SAL-MAT'), consumable: await getIssueCounter('SAL-CON') };
        const resources = ['material', 'consumable', 'material', 'consumable', 'material', 'consumable'];
        const results = await Promise.all(resources.map(resource => createIssue(resource).expect(200)));
        const folios = results.map(result => result.body.goodsIssue.referenceNumber);
        expect(new Set(folios).size).toBe(6);
        for (const [resource, prefix] of [['material', 'SAL-MAT'], ['consumable', 'SAL-CON']]) {
            const emitted = results.filter((_result, index) => resources[index] === resource)
                .map(result => Number(result.body.goodsIssue.referenceNumber.split('-').at(-1))).sort((a, b) => a - b);
            expect(emitted).toEqual([before[resource].counter + 1, before[resource].counter + 2, before[resource].counter + 3]);
            expect((await getIssueCounter(prefix)).counter).toBe(before[resource].counter + 3);
        }
    });

    it.each(['material', 'consumable'])('revierte el contador de %s cuando falla la escritura posterior del documento', async resource => {
        const prefix = resource === 'material' ? 'SAL-MAT' : 'SAL-CON';
        const beforeCounter = await getIssueCounter(prefix);
        const beforeIssues = await prisma.goodsIssue.count({ where: { departmentId: ids.department } });
        const beforeStock = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier } });

        await request(app).post(issuePath(resource))
            .send({ ...header(), projectNumber: 'PROJECT-NUMBER-TOO-LONG', details: [detail(resource)] }).expect(500);

        expect(await getIssueCounter(prefix)).toEqual(beforeCounter);
        expect(await prisma.goodsIssue.count({ where: { departmentId: ids.department } })).toBe(beforeIssues);
        expect(await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier } })).toEqual(beforeStock);
    });

});
