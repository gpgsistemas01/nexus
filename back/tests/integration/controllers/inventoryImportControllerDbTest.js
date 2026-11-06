import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { createInventoryImportFixture, inventoryWorkbook } from '../../helpers/inventoryImportFixture.js';
import { withPiecePresentation } from '../../helpers/withPiecePresentation.js';

let prisma, app, fixture, cookie, deniedCookie, previousSecret;
const preview = async (rows, resource = 'materials', mode = 'create') => {
    const buffer = await inventoryWorkbook({ resource, mode, rows });
    const response = await request(app).post(`/${resource}/preview`).query({ mode }).set('Cookie', cookie)
        .attach('file', buffer, 'inventario.xlsx').expect(200);
    return response.body.batch;
};
const confirm = (batch, operationId = randomUUID()) => request(app).post(`/${batch.id}/confirm`).set('Cookie', cookie)
    .send({ expectedVersion: batch.version, operationId });
const savedOffer = name => prisma.supplierMaterial.findFirst({ where: { material: { name } }, include: { material: true } });
const seedOffer = async name => {
    const material = await prisma.material.create({ data: { name: fixture.row(name).name,
        presentationId: fixture.presentation.id, unitMeasureId: fixture.unit.id, base: 2, height: 3, minStock: 1 } });
    return prisma.supplierMaterial.create({ data: { materialId: material.id, supplierId: fixture.suppliers[0].id,
        maxUnitCost: 10, currentStock: 2, convertedQuantity: 12 }, include: { material: true } });
};
const updateRow = offer => ({ id: offer.materialId, supplierId: offer.supplierId,
    expectedVersion: offer.version, expectedMaterialVersion: offer.material.version,
    name: offer.material.name, minStock: Number(offer.material.minStock), maxUnitCost: Number(offer.maxUnitCost), isActive: 'SI' });

describe('importación XLSX: permisos, estados y persistencia atómica', () => {
    beforeAll(async () => {
        previousSecret = process.env.JWT_SECRET_ACCESS;
        process.env.JWT_SECRET_ACCESS = randomUUID();
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        fixture = await createInventoryImportFixture(prisma);
        const router = (await import('../../../src/routes/api/warehouse/inventoryImportApiRoute.js')).default;
        app = createControllerTestApp({ registerRoutes: routerApp => routerApp.use(cookieParser(), router) });
        cookie = `accessToken=${jwt.sign({ id: fixture.user.id }, process.env.JWT_SECRET_ACCESS)}`;
        deniedCookie = `accessToken=${jwt.sign({ id: fixture.denied.id }, process.env.JWT_SECRET_ACCESS)}`;
    });
    afterAll(async () => {
        await fixture?.cleanup();
        if (previousSecret === undefined) delete process.env.JWT_SECRET_ACCESS;
        else process.env.JWT_SECRET_ACCESS = previousSecret;
    });

    it('autoriza antes de analizar el archivo y mantiene el lote privado', async () => {
        await request(app).post('/materials/preview').send('archivo inválido').expect(401);
        await request(app).post('/materials/preview').set('Cookie', deniedCookie).send('archivo inválido').expect(403);
        const batch = await preview([fixture.row('Privado')]);
        await request(app).get(`/${batch.id}`).set('Cookie', deniedCookie).expect(404);
        expect(await prisma.supplierMaterial.count({ where: { material: { name: fixture.row('Privado').name } } })).toBe(0);
    });

    it('crea dos proveedores de un material, stock, conversiones e historia; el reintento no duplica', async () => {
        const row = fixture.row('Compartido');
        const batch = await preview([row, { ...row, supplierCode: fixture.suppliers[1].code, newStock: 3 }]);
        expect(batch.preview.summary).toMatchObject({ creates: 2, errors: 0 });
        const operationId = randomUUID();
        const completed = await confirm(batch, operationId).expect(200);
        const repeated = await confirm(batch, operationId).expect(200);
        expect(repeated.body.batch).toEqual(completed.body.batch);
        const offers = await prisma.supplierMaterial.findMany({ where: { material: { name: row.name } } });
        expect(offers).toHaveLength(2);
        expect(new Set(offers.map(item => item.materialId)).size).toBe(1);
        expect(offers.map(item => Number(item.currentStock)).sort()).toEqual([2, 3]);
        expect(offers.map(item => Number(item.convertedQuantity)).sort((a,b) => a-b)).toEqual([12, 18]);
        expect(await prisma.stockAdjustmentDetail.count({ where: { materialId: offers[0].materialId } })).toBe(2);
        expect(await prisma.movementDetail.count({ where: { materialId: offers[0].materialId } })).toBe(2);
        expect(await prisma.inventoryImport.findUnique({ where: { id: batch.id } })).toMatchObject({ payload: null, preview: null, status: 'COMPLETED' });
        await confirm(batch).expect(409);
    });

    it('actualiza campos editables de un material compartido una vez y conserva los saldos', async () => {
        const offer = await seedOffer('Editar compartido');
        await prisma.supplierMaterial.create({ data: { materialId: offer.materialId, supplierId: fixture.suppliers[1].id,
            maxUnitCost: 10, currentStock: 3, convertedQuantity: 18 } });
        const offers = await prisma.supplierMaterial.findMany({ where: { materialId: offer.materialId }, include: { material: true } });
        const rows = offers.map(item => ({ ...updateRow(item), name: fixture.row('Renombrado').name, maxUnitCost: 22 }));
        const batch = await preview(rows, 'materials', 'update');
        expect(batch.preview.summary).toMatchObject({ updates: 2, errors: 0 });
        await confirm(batch).expect(200);
        const saved = await prisma.supplierMaterial.findMany({ where: { materialId: offer.materialId }, include: { material: true } });
        expect(saved.every(item => Number(item.maxUnitCost) === 22 && item.material.version === offer.material.version + 1)).toBe(true);
        expect(saved.map(item => Number(item.currentStock)).sort()).toEqual([2, 3]);
        expect(await prisma.stockAdjustmentDetail.count({ where: { materialId: offer.materialId } })).toBe(0);
        const unchanged = await preview(saved.map(updateRow), 'materials', 'update');
        expect(unchanged.preview.summary.unchanged).toBe(2);
        await confirm(unchanged).expect(200);
        expect((await prisma.material.findUnique({ where: { id: offer.materialId } })).version).toBe(offer.material.version + 1);
    });

    it('rechaza un archivo viejo antes de confirmar y un cambio entre vista previa y confirmación', async () => {
        const offer = await seedOffer('Versión vieja');
        const row = { ...updateRow(offer), maxUnitCost: 30 };
        const batch = await preview([row], 'materials', 'update');
        await prisma.supplierMaterial.update({ where: { id: offer.id }, data: { maxUnitCost: 29 } });
        await confirm(batch).expect(409);
        const stale = await preview([row], 'materials', 'update');
        expect(stale.preview.summary.errors).toBe(1);
        await confirm(stale).expect(400);
        expect(Number((await prisma.supplierMaterial.findUnique({ where: { id: offer.id } })).maxUnitCost)).toBe(29);
    });

    it('reutiliza la regla de PIEZA y conserva errores por fila sin aplicar filas válidas', async () => {
        await withPiecePresentation({ prisma }, async presentationId => {
            const presentation = await prisma.presentation.findUnique({ where: { id: presentationId } });
            const batch = await preview([fixture.row('Válido'), fixture.row('Fraccionario', { presentationName: presentation.name, newStock: 1.5 })]);
            expect(batch.preview.summary).toMatchObject({ creates: 1, errors: 1 });
            expect(batch.preview.rows[1].errors[0].message).toContain('enteras');
            await confirm(batch).expect(400);
            expect(await savedOffer(fixture.row('Válido').name)).toBeNull();
            await request(app).get(`/${batch.id}/errors/excel`).set('Cookie', cookie).expect(200).expect('Content-Type', /spreadsheetml/);
        });
    });

    it('registra consumibles sin dimensiones y permite costo cero sólo en el alta', async () => {
        const row = fixture.row('Consumible', { maxUnitCost: 0 });
        const batch = await preview([row], 'consumables');
        expect(batch.preview.rows[0].warnings).toHaveLength(1);
        await confirm(batch).expect(200);
        const saved = await savedOffer(row.name);
        expect(saved.material).toMatchObject({ type: 'CONSUMABLE', base: null, height: null });
        expect(Number(saved.convertedQuantity)).toBe(2);
        const invalid = await preview([updateRow(saved)], 'consumables', 'update');
        expect(invalid.preview.summary.errors).toBe(1);
    });

    it('crea y actualiza merma con referencia del proveedor y registra sólo las entradas positivas', async () => {
        const source = await seedOffer('Fuente de merma');
        const row = { name: fixture.row('Merma').name, supplierCode: fixture.suppliers[0].code, materialId: source.materialId,
            base: 1, height: 2, minStock: 0, maxUnitCost: 10, isActive: 'SI', initialQuantity: 4 };
        const batch = await preview([row, { ...row, name: `${row.name} cero`, initialQuantity: 0 }], 'wastes');
        expect(batch.preview.summary).toMatchObject({ creates: 2, errors: 0 });
        const response = await confirm(batch).expect(200);
        const id = response.body.batch.result.rows[0].id;
        let waste = await prisma.waste.findUnique({ where: { id } });
        expect(Number(waste.currentStock)).toBe(4);
        expect(Number(waste.convertedQuantity)).toBe(8);
        expect(await prisma.wasteStockEntry.count({ where: { createdById: fixture.user.id } })).toBe(1);
        const update = await preview([{ id, expectedVersion: waste.version, name: `${row.name} editada`, minStock: 1, maxUnitCost: 12, isActive: 'NO' }], 'wastes', 'update');
        await confirm(update).expect(200);
        waste = await prisma.waste.findUnique({ where: { id } });
        expect(waste.isActive).toBe(false);
        expect(Number(waste.currentStock)).toBe(4);
        expect(Number(waste.maxUnitCost)).toBe(12);
    });

    it('descarta el borrador y limpia los vencidos sin tocar recibos confirmados', async () => {
        const completed = await preview([fixture.row('Recibo que permanece')]);
        await confirm(completed).expect(200);
        const batch = await preview([fixture.row('Descartado')]);
        await request(app).delete(`/${batch.id}`).set('Cookie', cookie).expect(200);
        await confirm(batch).expect(409);
        expect(await prisma.inventoryImport.findUnique({ where: { id: batch.id } })).toMatchObject({ status: 'CANCELED', preview: null, payload: null });
        const expired = await preview([fixture.row('Vencido')]);
        await prisma.inventoryImport.update({ where: { id: expired.id }, data: { expiresAt: new Date(0) } });
        await confirm({ ...expired, version: expired.version + 1 }).expect(410);
        const { expireInventoryImportDrafts } = await import('../../../src/services/warehouse/imports/inventoryImportCleanup.js');
        expect(await expireInventoryImportDrafts()).toBeGreaterThanOrEqual(1);
        expect(await prisma.inventoryImport.findUnique({ where: { id: expired.id } })).toMatchObject({ status: 'EXPIRED', preview: null, payload: null });
        expect(await prisma.inventoryImport.findUnique({ where: { id: completed.id } })).toMatchObject({ status: 'COMPLETED', result: expect.any(Object) });
    });

    it('revierte artículos, saldos, historia y folios si falla la escritura final del recibo', async () => {
        const batch = await preview([fixture.row('Rollback A'), fixture.row('Rollback B')]);
        const counters = () => prisma.referenceNumberCounter.findMany({ orderBy: [{ prefix: 'asc' }, { year: 'asc' }] });
        const before = await counters();
        await prisma.$executeRawUnsafe(`CREATE FUNCTION test_import_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.id = '${batch.id}'::uuid AND NEW.status = 'COMPLETED' THEN RAISE EXCEPTION 'test receipt failure'; END IF; RETURN NEW; END $$`);
        await prisma.$executeRawUnsafe('CREATE TRIGGER test_import_failure BEFORE UPDATE ON "InventoryImport" FOR EACH ROW EXECUTE FUNCTION test_import_failure()');
        try {
            await confirm(batch).expect(500);
            expect(await savedOffer(fixture.row('Rollback A').name)).toBeNull();
            expect(await counters()).toEqual(before);
            expect(await prisma.inventoryImport.findUnique({ where: { id: batch.id } })).toMatchObject({ status: 'DRAFT', version: batch.version });
        } finally {
            await prisma.$executeRawUnsafe('DROP TRIGGER test_import_failure ON "InventoryImport"');
            await prisma.$executeRawUnsafe('DROP FUNCTION test_import_failure()');
        }
    });

    it('serializa el mismo lote y responde rápido si otra confirmación ocupa la puerta global', async () => {
        const batch = await preview([fixture.row('Concurrente')]);
        const operationId = randomUUID();
        const results = await Promise.all([confirm(batch, operationId), confirm(batch, operationId)]);
        expect(results.map(result => result.status)).toEqual([200, 200]);
        expect(results[0].body.batch).toEqual(results[1].body.batch);
        const waiting = await preview([fixture.row('Ocupado')]);
        let release, acquired;
        const ready = new Promise(resolve => { acquired = resolve; });
        const held = new Promise(resolve => { release = resolve; });
        const lock = prisma.$transaction(async tx => { await tx.$queryRaw`SELECT pg_advisory_xact_lock(733040, 1)::text`; acquired(); await held; });
        await Promise.race([ready, lock]);
        try {
            const response = await confirm(waiting).expect(429);
            expect(response.body.code).toBe('INVENTORY_IMPORT_BUSY');
            expect(await savedOffer(fixture.row('Ocupado').name)).toBeNull();
        } finally { release(); await lock; }
    });

    it('calcula las medidas y peso neto de ROLLO con las reglas existentes', async () => {
        const existing = await prisma.presentation.findUnique({ where: { name: 'ROLLO' } });
        const roll = existing ?? await prisma.presentation.create({ data: { name: 'ROLLO' } });
        if (!existing) fixture.extraPresentations.push(roll.id);
        const source = await prisma.material.create({ data: { name: fixture.row('Rollo fuente').name,
            presentationId: roll.id, unitMeasureId: fixture.unit.id, base: 2, height: 10 } });
        await prisma.supplierMaterial.create({ data: { materialId: source.id, supplierId: fixture.suppliers[0].id, maxUnitCost: 10 } });
        const row = { name: fixture.row('Rollo merma').name, supplierCode: fixture.suppliers[0].code, materialId: source.id,
            minStock: 0, maxUnitCost: 10, isActive: 'SI', initialQuantity: 2, coneWeightKg: 1, totalWeightKg: 5, referenceRollTotalWeightKg: 11 };
        const batch = await preview([row], 'wastes');
        expect(batch.preview.summary.errors).toBe(0);
        const response = await confirm(batch).expect(200);
        const waste = await prisma.waste.findUnique({ where: { id: response.body.batch.result.rows[0].id } });
        expect([Number(waste.base), Number(waste.height), Number(waste.weightKg), Number(waste.currentStock), Number(waste.convertedQuantity)])
            .toEqual([2, 4, 4, 2, 16]);
    });

    it('publica la ruta multipart en la aplicación real y rechaza cargas fuera del contrato', async () => {
        const { createApp } = await import('../../../src/app.js');
        const actual = createApp();
        const buffer = await inventoryWorkbook({ rows: [fixture.row('Aplicación real')] });
        const response = await request(actual).post('/api/warehouse/inventory-imports/materials/preview').set('Cookie', cookie)
            .attach('file', buffer, 'inventario.xlsx').expect(200);
        expect(response.body.batch.preview.summary.errors).toBe(0);
        await request(actual).post('/api/warehouse/inventory-imports/materials/preview').set('Cookie', cookie)
            .attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), 'inventario.xlsx').expect(413);
        await request(actual).post('/api/warehouse/inventory-imports/materials/preview').set('Cookie', cookie)
            .field('resource', 'wastes').attach('file', buffer, 'inventario.xlsx').expect(400);
        await request(actual).post('/api/warehouse/inventory-imports/materials/preview').set('Cookie', cookie)
            .attach('file', buffer, 'inventario.csv').expect(400);
    });

    it('genera una plantilla descargable con IDs y versiones y permite validar su actualización', async () => {
        await seedOffer('Plantilla actual');
        const { createInventoryImportTemplate } = await import('../../../src/services/warehouse/imports/inventoryImportTemplateService.js');
        const bytes = await createInventoryImportTemplate({ user: fixture.user, resource: 'materials', mode: 'update', query: { supplierId: fixture.suppliers[0].id, search: 'Plantilla actual' } });
        const response = await request(app).post('/materials/preview?mode=update').set('Cookie', cookie)
            .attach('file', Buffer.from(bytes), 'actualizar.xlsx').expect(200);
        expect(response.body.batch.preview.summary).toMatchObject({ unchanged: 1, errors: 0 });
    });

    it('informa IDs de proveedor inválidos por fila sin abortar toda la vista previa', async () => {
        const offer = await seedOffer('Proveedor inválido');
        const batch = await preview([{ ...updateRow(offer), supplierId: 'no-es-uuid' }], 'materials', 'update');
        expect(batch.preview.summary.errors).toBe(1);
        expect(batch.preview.rows[0].errors).toContainEqual(expect.objectContaining({ column: 'id_proveedor' }));
        expect(Number((await prisma.supplierMaterial.findUnique({ where: { id: offer.id } })).maxUnitCost)).toBe(10);
    });
});
