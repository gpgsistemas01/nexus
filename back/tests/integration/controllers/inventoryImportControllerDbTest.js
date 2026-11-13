import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import ExcelJS from 'exceljs';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { createInventoryImportFixture, inventoryWorkbook, writeInventoryWorkbook } from '../../helpers/inventoryImportFixture.js';
import { withPiecePresentation } from '../../helpers/withPiecePresentation.js';
import { readExcelReport } from '../../helpers/readExcelReport.js';
import { getImportConfig } from '../../../src/services/warehouse/imports/inventoryImportConfig.js';
import { PERMISSIONS } from '../../../src/shared/constants/permissions.js';

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

const newRow = async (resource, name) => {
    if (resource !== 'wastes') return fixture.row(name);
    const source = await seedOffer(`Fuente ${name}`);
    return { name: fixture.row(name).name, supplierCode: fixture.suppliers[0].code, materialId: source.materialId,
        base: 1.5, height: 2, minStock: 1, maxUnitCost: 10, isActive: 'SI', initialQuantity: 3 };
};

const inventorySnapshot = async () => {
    const supplierIds = fixture.suppliers.map(item => item.id);
    return JSON.parse(JSON.stringify(await prisma.$transaction([
        prisma.material.count({ where: { supplierMaterials: { some: { supplierId: { in: supplierIds } } } } }),
        prisma.supplierMaterial.findMany({ where: { supplierId: { in: supplierIds } }, orderBy: { id: 'asc' } }),
        prisma.waste.findMany({ where: { supplierId: { in: supplierIds } }, orderBy: { id: 'asc' } }),
        prisma.stockAdjustment.count({ where: { createdById: fixture.user.id } }),
        prisma.movementDetail.count({ where: { supplierId: { in: supplierIds } } }),
        prisma.wasteStockEntry.count({ where: { createdById: fixture.user.id } }),
        prisma.wasteMovementDetail.count({ where: { waste: { supplierId: { in: supplierIds } } } }),
        prisma.inventoryImport.count({ where: { userId: fixture.user.id, status: 'COMPLETED' } }),
        prisma.referenceNumberCounter.findMany({ orderBy: [{ prefix: 'asc' }, { year: 'asc' }] })
    ])));
};

describe('importación XLSX: permisos, estados y persistencia atómica', () => {
    const countRow = async (offer, newStock, extra = {}) => ({ id: offer.materialId, supplierId: offer.supplierId,
        expectedVersion: offer.version, expectedMaterialVersion: offer.material.version, newStock,
        reasonId: (await prisma.stockAdjustmentReason.findUnique({ where: { name: 'Stock inicial' } })).id,
        observations: 'Conteo físico actual verificado', ...extra });
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

    it('reemplaza el saldo por conteo cero o positivo, conserva datos, omite iguales y devuelve folios sin duplicar', async () => {
        const offers = await Promise.all(['Conteo cero', 'Conteo mayor', 'Conteo igual'].map(seedOffer));
        const batch = await preview(await Promise.all(offers.map((offer, index) => countRow(offer, [0, 5, 2][index]))), 'materials', 'adjust');
        expect(batch.preview.summary).toMatchObject({ updates: 2, unchanged: 1, errors: 0 });
        expect(batch.preview.rows[0]).toMatchObject({ before: { currentStock: 2 }, after: { currentStock: 0 }, details: { difference: -2 } });
        const operationId = randomUUID();
        const applied = await confirm(batch, operationId).expect(200);
        expect(applied.body.batch.result.rows.slice(0, 2).every(row => /^AJU-/.test(row.details.adjustmentReference))).toBe(true);
        const snapshot = await inventorySnapshot();
        await confirm(batch, operationId).expect(200);
        expect(await inventorySnapshot()).toEqual(snapshot);
        for (const [index, offer] of offers.entries()) {
            const saved = await prisma.supplierMaterial.findUnique({ where: { id: offer.id }, include: { material: true } });
            expect(Number(saved.currentStock)).toBe([0, 5, 2][index]);
            expect(Number(saved.convertedQuantity)).toBe([0, 30, 12][index]);
            expect(Number(saved.maxUnitCost)).toBe(10);
            expect(saved.material).toEqual(offer.material);
        }
        const adjustment = await prisma.stockAdjustment.findFirst({ where: { details: { some: { materialId: offers[0].materialId } } } });
        expect(adjustment.type).toBe('DECREASE');
    });

    it.each(['materials', 'consumables', 'wastes'])('rechaza una operación no admitida para %s antes de analizar el archivo', async resource => {
        const before = await inventorySnapshot();
        const drafts = await prisma.inventoryImport.count({ where: { userId: fixture.user.id } });
        await request(app).get(`/${resource}/template`).query({ mode: 'mixed' }).set('Cookie', cookie)
            .expect(400).expect(({ body }) => expect(body.code).toBe('INVENTORY_IMPORT_FILE'));
        await request(app).post(`/${resource}/preview`).query({ mode: 'mixed' }).set('Cookie', cookie)
            .send('ni siquiera es XLSX').expect(400).expect(({ body }) => expect(body.code).toBe('INVENTORY_IMPORT_FILE'));
        expect(await inventorySnapshot()).toEqual(before);
        expect(await prisma.inventoryImport.count({ where: { userId: fixture.user.id } })).toBe(drafts);
    });

    it('la operación del archivo debe coincidir con la selección; ninguna combinación cruzada crea borradores ni escrituras', async () => {
        const before = await inventorySnapshot();
        const drafts = await prisma.inventoryImport.count({ where: { userId: fixture.user.id } });
        for (const source of ['create', 'update', 'adjust']) {
            const buffer = await inventoryWorkbook({ mode: source, rows: [fixture.row('Operación cruzada')] });
            for (const selected of ['create', 'update', 'adjust'].filter(mode => mode !== source)) {
                await request(app).post('/materials/preview').query({ mode: selected }).set('Cookie', cookie)
                    .attach('file', buffer, 'inventario.xlsx').expect(400)
                    .expect(({ body }) => expect(body.code).toBe('INVENTORY_IMPORT_FILE'));
            }
        }
        expect(await inventorySnapshot()).toEqual(before);
        expect(await prisma.inventoryImport.count({ where: { userId: fixture.user.id } })).toBe(drafts);
    });

    it('usa la misma estructura de consulta al editar y contar merma en archivos separados con IDs originales', async () => {
        const row = await newRow('wastes', 'Plantilla de merma');
        const created = await confirm(await preview([row], 'wastes')).expect(200);
        const id = created.body.batch.result.rows[0].id;
        const original = await prisma.waste.findUnique({ where: { id } });
        const reason = await prisma.stockAdjustmentReason.findUnique({ where: { name: 'Stock inicial' } });
        for (const mode of ['update', 'adjust']) {
            const response = await request(app).get('/wastes/template').query({ mode, supplierId: fixture.suppliers[0].id, search: row.name }).set('Cookie', cookie)
                .buffer(true).parse((res, done) => { const chunks = []; res.on('data', chunk => chunks.push(chunk)); res.on('end', () => done(null, Buffer.concat(chunks))); }).expect(200);
            const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(response.body);
            const sheet = workbook.getWorksheet('Datos'); const headers = sheet.getRow(1).values.slice(1);
            expect(headers.slice(0, 5)).toEqual(['Proveedor', 'Material', 'Base', 'Altura', 'Stock actual']);
            expect(sheet.getCell(2, headers.indexOf('ID merma') + 1).value).toBe(id);
            const changes = mode === 'update' ? { Material: `${row.name} corregida`, 'Costo unitario': 19 }
                : { 'Stock contado': 2, Motivo: `${reason.id} | ${reason.name}`, Observaciones: 'Conteo físico comprobado' };
            for (const [header, value] of Object.entries(changes)) sheet.getCell(2, headers.indexOf(header) + 1).value = value;
            const uploaded = await request(app).post('/wastes/preview').query({ mode }).set('Cookie', cookie)
                .attach('file', await writeInventoryWorkbook(workbook), `merma-${mode}.xlsx`).expect(200);
            expect(uploaded.body.batch.preview.summary.errors).toBe(0);
            await confirm(uploaded.body.batch).expect(200);
            const saved = await prisma.waste.findUnique({ where: { id } });
            expect(saved.name).toBe(`${row.name} corregida`); expect(Number(saved.maxUnitCost)).toBe(19);
            expect(Number(saved.currentStock)).toBe(mode === 'update' ? 3 : 2);
            expect(saved.base).toEqual(original.base); expect(saved.height).toEqual(original.height);
        }
    });

    it('rechaza vacío, negativo, motivo ausente, duplicado y recurso cruzado sin aplicar el conteo válido', async () => {
        const offer = await seedOffer('Conteo inválido');
        const valid = await countRow(offer, 4);
        for (const rows of [[{ ...valid, newStock: '' }], [{ ...valid, newStock: -1 }], [{ ...valid, reasonId: '' }], [valid, valid]]) {
            const batch = await preview(rows, 'materials', 'adjust');
            expect(batch.preview.summary.errors).toBeGreaterThan(0);
            await confirm(batch).expect(400);
        }
        const crossed = await preview([valid], 'consumables', 'adjust');
        expect(crossed.preview.summary.errors).toBe(1);
        expect(Number((await prisma.supplierMaterial.findUnique({ where: { id: offer.id } })).currentStock)).toBe(2);
        expect(await prisma.stockAdjustmentDetail.count({ where: { materialId: offer.materialId } })).toBe(0);
    });

    it('conserva las versiones del archivo y revierte el lote si un movimiento cambia un saldo después de la vista previa', async () => {
        const offers = await Promise.all(['Conteo concurrente 1', 'Conteo concurrente 2'].map(seedOffer));
        const rows = await Promise.all(offers.map(offer => countRow(offer, 6)));
        const batch = await preview(rows, 'materials', 'adjust');
        await prisma.supplierMaterial.update({ where: { id: offers[1].id }, data: { currentStock: 3, convertedQuantity: 18 } });
        const before = await inventorySnapshot();
        await confirm(batch).expect(409);
        expect(await inventorySnapshot()).toEqual(before);
        const stale = await preview(rows, 'materials', 'adjust');
        expect(stale.preview.summary.errors).toBe(1);
    });

    it('ajusta merma con AME y sus conversiones sin registrarlo como entrada inicial', async () => {
        const row = await newRow('wastes', 'Merma contada');
        await confirm(await preview([row], 'wastes')).expect(200);
        const waste = await prisma.waste.findFirst({ where: { name: row.name } });
        const reason = await prisma.stockAdjustmentReason.findUnique({ where: { name: 'Stock inicial' } });
        const batch = await preview([{ id: waste.id, expectedVersion: waste.version, newStock: 1,
            reasonId: `${reason.id} | ${reason.name}`, observations: 'Conteo físico de merma' }], 'wastes', 'adjust');
        expect(batch.preview.summary.errors).toBe(0);
        const result = await confirm(batch).expect(200);
        expect(result.body.batch.result.rows[0].details.adjustmentReference).toMatch(/^AME-/);
        const saved = await prisma.waste.findUnique({ where: { id: waste.id } });
        expect(Number(saved.currentStock)).toBe(1);
        expect(Number(saved.convertedQuantity)).toBe(3);
        expect(await prisma.wasteStockEntry.count({ where: { wasteId: waste.id } })).toBe(1);
        expect(await prisma.wasteStockAdjustmentDetail.findFirst({ where: { wasteId: waste.id } })).toMatchObject({
            previousStock: expect.anything(), newStock: expect.anything(), difference: expect.anything()
        });
    });

    it('descarga el conteo en blanco con datos actuales, sin columnas de costo ni edición de identidad', async () => {
        const offer = await seedOffer('Plantilla conteo');
        const response = await request(app).get('/materials/template').query({ mode: 'adjust', search: offer.material.name }).set('Cookie', cookie)
            .buffer(true).parse((res, done) => { const chunks = []; res.on('data', chunk => chunks.push(chunk)); res.on('end', () => done(null, Buffer.concat(chunks))); }).expect(200);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.body);
        const sheet = workbook.getWorksheet('Datos');
        const headers = sheet.getRow(1).values.slice(1);
        expect(headers).toContain('Stock contado');
        expect(headers).not.toContain('Costo unitario');
        expect(sheet.getCell(2, headers.indexOf('Stock contado') + 1).value ?? '').toBe('');
        expect(sheet.getCell(2, headers.indexOf('Stock actual') + 1).value).toBe(2);
    });

    it('al perder lectura de costos, protege las ediciones sin bloquear los conteos', async () => {
        const offer = await seedOffer('Permisos recuperables');
        const editing = await preview([{ ...updateRow(offer), maxUnitCost: 17 }], 'materials', 'update');
        const counting = await preview([await countRow(offer, 3)], 'materials', 'adjust');
        const user = { ...fixture.user, permissions: [PERMISSIONS.MATERIALS_READ, PERMISSIONS.MATERIALS_ADJUST_STOCK] };
        const { getInventoryImport } = await import('../../../src/services/warehouse/imports/inventoryImportService.js');
        await expect(getInventoryImport({ id: editing.id, user })).rejects.toMatchObject({ statusCode: 403 });
        expect((await getInventoryImport({ id: counting.id, user })).preview.rows[0].after).toMatchObject({ currentStock: 3 });
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
            const response = await request(app).get(`/${batch.id}/errors/excel`).set('Cookie', cookie)
                .buffer(true).parse((res, done) => {
                    const chunks = [];
                    res.on('data', chunk => chunks.push(chunk));
                    res.on('end', () => done(null, Buffer.concat(chunks)));
                }).expect(200).expect('Content-Type', /spreadsheetml/).expect('Cache-Control', 'no-store');
            const report = await readExcelReport(response.body);
            expect(report.workbook.worksheets.map(sheet => sheet.name)).toEqual(['Datos']);
            expect(report.rows).toEqual([['fila', 'nombre', 'columna', 'mensaje'],
                ...batch.preview.rows.flatMap(row => row.errors.map(error => [row.row, row.name, error.column, error.message]))]);
            expect((await prisma.inventoryImport.findUnique({ where: { id: batch.id } })).status).toBe('DRAFT');
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
        expect(await prisma.wasteStockEntry.count({ where: { wasteId: id } })).toBe(1);
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

    it.each(['create', 'adjust'])('revierte filas, saldos, historia y folios si falla el recibo de %s', async mode => {
        const offer = await seedOffer(`Rollback ${mode}`);
        const batch = mode === 'create' ? await preview([fixture.row('Rollback A'), fixture.row('Rollback B')])
            : await preview([await countRow(offer, 0)], 'materials', 'adjust');
        expect(batch.preview.summary.errors).toBe(0);
        const inventoryBefore = await inventorySnapshot();
        await prisma.$executeRawUnsafe(`CREATE FUNCTION test_import_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.id = '${batch.id}'::uuid AND NEW.status = 'COMPLETED' THEN RAISE EXCEPTION 'test receipt failure'; END IF; RETURN NEW; END $$`);
        await prisma.$executeRawUnsafe('CREATE TRIGGER test_import_failure BEFORE UPDATE ON "InventoryImport" FOR EACH ROW EXECUTE FUNCTION test_import_failure()');
        try {
            await confirm(batch).expect(500);
            expect(await savedOffer(fixture.row('Rollback A').name)).toBeNull();
            expect(await inventorySnapshot()).toEqual(inventoryBefore);
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

    it('descarga IDs y versiones, permite editar el nombre y actualiza el mismo registro al subirlo', async () => {
        const offer = await seedOffer('Plantilla actual');
        const { createInventoryImportTemplate } = await import('../../../src/services/warehouse/imports/inventoryImportTemplateService.js');
        const bytes = await createInventoryImportTemplate({ user: fixture.user, resource: 'materials', mode: 'update', query: { supplierId: fixture.suppliers[0].id, search: 'Plantilla actual' } });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(Buffer.from(bytes));
        const sheet = workbook.getWorksheet('Datos');
        const headers = sheet.getRow(1).values.slice(1);
        expect(headers.slice(0, 10)).toEqual(['Proveedor', 'Material', 'Base', 'Altura', 'Stock actual', 'Stock mínimo', 'Presentación', 'Conversión', 'Unidad', 'Costo unitario']);
        expect(['ID material', 'ID proveedor', 'Versión proveedor', 'Versión material'].map(header => sheet.getCell(2, headers.indexOf(header) + 1).value))
            .toEqual([offer.materialId, offer.supplierId, offer.version, offer.material.version]);
        const name = fixture.row('Plantilla editada').name;
        sheet.getCell(2, headers.indexOf('Material') + 1).value = name;
        const response = await request(app).post('/materials/preview?mode=update').set('Cookie', cookie)
            .attach('file', await writeInventoryWorkbook(workbook), 'actualizar.xlsx').expect(200);
        const batch = response.body.batch;
        expect(batch.preview.summary).toMatchObject({ updates: 1, errors: 0 });
        expect(batch.preview.rows[0]).toMatchObject({ id: offer.materialId, before: { name: offer.material.name }, after: { name } });
        await confirm(batch).expect(200);
        const saved = await prisma.supplierMaterial.findUnique({ where: { id: offer.id }, include: { material: true } });
        expect(saved.material).toMatchObject({ id: offer.materialId, name });
        expect(Number(saved.currentStock)).toBe(2);
        expect(await prisma.material.count({ where: { name } })).toBe(1);
    });

    it('informa IDs de proveedor inválidos por fila sin abortar toda la vista previa', async () => {
        const offer = await seedOffer('Proveedor inválido');
        const batch = await preview([{ ...updateRow(offer), supplierId: 'no-es-uuid' }], 'materials', 'update');
        expect(batch.preview.summary.errors).toBe(1);
        expect(batch.preview.rows[0].errors).toContainEqual(expect.objectContaining({ column: 'ID proveedor' }));
        expect(Number((await prisma.supplierMaterial.findUnique({ where: { id: offer.id } })).maxUnitCost)).toBe(10);
    });

    it.each(['materials', 'consumables', 'wastes'])('%s: un repetido dentro del Excel bloquea también las filas nuevas válidas', async resource => {
        const row = await newRow(resource, `Duplicado interno ${resource}`);
        const valid = { ...row, name: fixture.row(`Fila válida interna ${resource}`).name };
        const before = await inventorySnapshot();
        const batch = await preview([valid, row, { ...row, name: `  ${row.name}  `, newStock: 9, initialQuantity: 9 }], resource);
        expect(batch.preview.summary).toMatchObject({ total: 3, creates: 2, errors: 1 });
        expect(batch.preview.rows[2].errors).toContainEqual(expect.objectContaining({ column: 'Material', message: expect.stringContaining('fila 3') }));
        await confirm(batch).expect(400);
        expect(await inventorySnapshot()).toEqual(before);
    });

    it.each(['materials', 'consumables', 'wastes'])('%s: un registro ya existente bloquea todo el archivo sin sumar stock', async resource => {
        const row = await newRow(resource, `Duplicado existente ${resource}`);
        const existing = await preview([row], resource);
        expect(existing.preview.summary.errors).toBe(0);
        await confirm(existing).expect(200);
        const valid = { ...row, name: fixture.row(`Fila válida externa ${resource}`).name };
        const before = await inventorySnapshot();
        const batch = await preview([valid, { ...row, newStock: 8, initialQuantity: 8 }], resource);
        expect(batch.preview.summary).toMatchObject({ creates: 1, errors: 1 });
        expect(batch.preview.rows[1].errors).toContainEqual(expect.objectContaining({ column: 'Material', message: expect.stringMatching(/ya existe|ya está registrada/) }));
        await confirm(batch).expect(400);
        expect(await inventorySnapshot()).toEqual(before);
    });

    it('un duplicado registrado después de validar deja todo el lote sin aplicar al confirmar', async () => {
        const valid = fixture.row('Válido antes de carrera');
        const repeated = fixture.row('Duplicado por carrera');
        const batch = await preview([valid, repeated]);
        expect(batch.preview.summary.errors).toBe(0);
        await seedOffer('Duplicado por carrera');
        const before = await inventorySnapshot();
        const response = await confirm(batch).expect(409);
        expect(response.body).toMatchObject({ code: 'INVENTORY_IMPORT_CONFLICT', meta: { rows: [expect.objectContaining({ row: 3, action: 'error' })] } });
        expect(await inventorySnapshot()).toEqual(before);
        expect(await savedOffer(valid.name)).toBeNull();
    });

    it('una fila sin ID en Actualizar datos no se convierte en un alta', async () => {
        const before = await inventorySnapshot();
        const batch = await preview([{ name: fixture.row('Actualización sin ID').name, supplierId: fixture.suppliers[0].id,
            expectedVersion: 0, expectedMaterialVersion: 0, minStock: 1, maxUnitCost: 10, isActive: 'SI' }], 'materials', 'update');
        expect(batch.preview.summary).toMatchObject({ creates: 0, updates: 0, errors: 1 });
        expect(batch.preview.rows[0].errors).toContainEqual(expect.objectContaining({ column: 'ID material' }));
        await confirm(batch).expect(400);
        expect(await inventorySnapshot()).toEqual(before);
    });

    it('el alta de merma usa la opción del catálogo sin capturar un ID nuevo', async () => {
        const source = await seedOffer('Referencia seleccionable');
        const { createInventoryImportTemplate } = await import('../../../src/services/warehouse/imports/inventoryImportTemplateService.js');
        const bytes = await createInventoryImportTemplate({ user: fixture.user, resource: 'wastes', mode: 'create', query: { supplierId: source.supplierId, search: source.material.name } });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(Buffer.from(bytes));
        const catalog = workbook.getWorksheet('Catalogos');
        const headers = catalog.getRow(1).values.slice(1);
        expect(headers).toContain('Material de referencia');
        expect(headers).toContain('Proveedor (código | nombre)');
        const reference = catalog.getCell(2, headers.indexOf('Material de referencia') + 1).value;
        expect(reference).toContain(`${source.materialId} | ${source.material.name}`);
        const data = { name: fixture.row('Merma desde catálogo').name, supplierCode: catalog.getCell(2, headers.indexOf('Proveedor (código | nombre)') + 1).value,
            materialId: reference, base: 1.5, height: 2, minStock: 0, maxUnitCost: 10, isActive: 'SI', initialQuantity: 3 };
        const columns = getImportConfig('wastes', 'create').columns;
        expect(columns.map(([header]) => header)).not.toContain('ID merma');
        workbook.getWorksheet('Datos').getRow(2).values = columns.map(([, key]) => data[key] ?? '');
        const response = await request(app).post('/wastes/preview').set('Cookie', cookie)
            .attach('file', await writeInventoryWorkbook(workbook), 'mermas.xlsx').expect(200);
        const batch = response.body.batch;
        expect(batch.preview.summary).toMatchObject({ creates: 1, errors: 0 });
        const confirmed = await confirm(batch).expect(200);
        const waste = await prisma.waste.findUnique({ where: { id: confirmed.body.batch.result.rows[0].id } });
        expect(waste).toMatchObject({ name: data.name, sourceMaterialId: source.materialId });
        expect(Number(waste.currentStock)).toBe(3);
    });
});
