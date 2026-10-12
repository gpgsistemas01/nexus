import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import XLSX from 'xlsx';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { wasteValidation, wasteEditValidation, wasteStockAdditionValidation } from '../../../src/validators/forms/wasteValidations.js';
import { validate } from '../../../src/middleware/validatorMiddleware.js';

const suffix = Math.random().toString(36).slice(2, 8);
const ids = {};
let prisma;
let app;
let roll;
const createBody = resource => ({
    name: `IT Weight ${resource} ${suffix}`, materialId: ids[resource], supplierId: ids.supplier,
    base: 1.5, height: 2, maxUnitCost: 10, newStock: 3, minStock: 0, isActive: true
});

describe('peso unitario de merma de rollo', () => {
    beforeAll(async () => {
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        const controller = await import('../../../src/controllers/api/warehouse/wasteController.js');
        const reportController = await import('../../../src/controllers/api/warehouse/reportController.js');
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => { req.user = { id: ids.user, permissions: [] }; next(); });
            router.get('/wastes', controller.getAllWastes);
            router.get('/waste-report', reportController.exportWasteReportExcel);
            router.post('/wastes', wasteValidation, validate, controller.registerWaste);
            router.patch('/wastes/:id', wasteEditValidation, validate, controller.editWaste);
            router.post('/wastes/:id/stock-entries', wasteStockAdditionValidation, validate, controller.registerWasteStockAddition);
        } });
        await prisma.stockAdjustmentReason.upsert({ where: { name: 'Stock inicial' }, update: {}, create: { name: 'Stock inicial' } });
        ids.user = (await prisma.user.create({ data: { name: `IT Weight User ${suffix}`, password: 'integration-only' } })).id;
        ids.unit = (await prisma.unitMeasure.create({ data: { name: `IT WG ${suffix}`, symbol: `k${suffix}` } })).id;
        ids.supplier = (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `WG${suffix}`,
            legalName: `IT Weight Legal ${suffix}`, tradeName: `IT Weight Supplier ${suffix}`
        } })).id;
        for (const [resource, presentationName] of [['roll', 'ROLLO'], ['sheet', `IT Weight Sheet ${suffix}`]]) {
            ids[`${resource}Presentation`] = (await prisma.presentation.upsert({
                where: { name: presentationName }, update: {}, create: { name: presentationName }
            })).id;
            ids[resource] = (await prisma.material.create({ data: {
                name: `IT Weight ${resource} ${suffix}`, presentationId: ids[`${resource}Presentation`], unitMeasureId: ids.unit, base: 1.5, height: 20
            } })).id;
            await prisma.supplierMaterial.create({ data: { supplierId: ids.supplier, materialId: ids[resource], maxUnitCost: 10 } });
        }
    });

    afterAll(async () => {
        if (!prisma || !ids.supplier) return;
        const wastes = await prisma.waste.findMany({ where: { supplierId: ids.supplier }, select: { id: true } });
        const wasteIds = wastes.map(row => row.id);
        const adjustments = await prisma.wasteStockAdjustment.findMany({ where: { createdById: ids.user }, select: { id: true } });
        const adjustmentIds = adjustments.map(row => row.id);
        await prisma.wasteStockEntry.deleteMany({ where: { wasteId: { in: wasteIds } } });
        await prisma.wasteStockAdjustmentDetail.deleteMany({ where: { wasteStockAdjustmentId: { in: adjustmentIds } } });
        await prisma.wasteStockAdjustment.deleteMany({ where: { id: { in: adjustmentIds } } });
        const movements = await prisma.wasteMovementDetail.findMany({ where: { wasteId: { in: wasteIds } }, select: { movementId: true } });
        await prisma.wasteMovementDetail.deleteMany({ where: { wasteId: { in: wasteIds } } });
        await prisma.wasteMovement.deleteMany({ where: { id: { in: movements.map(row => row.movementId) } } });
        await prisma.waste.deleteMany({ where: { id: { in: wasteIds } } });
        await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
        await prisma.material.deleteMany({ where: { id: { in: [ids.roll, ids.sheet] } } });
        await prisma.supplier.delete({ where: { id: ids.supplier } });
        await prisma.user.delete({ where: { id: ids.user } });
        await prisma.unitMeasure.delete({ where: { id: ids.unit } });
        await prisma.presentation.delete({ where: { id: ids.sheetPresentation } });
    });

    it('registra peso en kg por unidad y lo devuelve al consultar sin cambiar el cálculo de existencia', async () => {
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), weightKg: '1.234567' }).expect(200);
        roll = response.body.waste;
        const persisted = await prisma.waste.findUnique({ where: { id: roll.id } });
        expect(Number(persisted.weightKg)).toBe(1.234567);
        expect(Number(persisted.currentStock)).toBe(3);
        expect(Number(persisted.convertedQuantity)).toBe(9);
        const list = await request(app).get('/wastes').query({ supplierId: ids.supplier }).expect(200);
        expect(Number(list.body.data[0].weightKg)).toBe(1.234567);
    });

    it('mantiene una sola identidad por medidas y rechaza otro registro aunque cambie el peso', async () => {
        const count = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        await request(app).post('/wastes').send({ ...createBody('roll'), weightKg: 9 }).expect(409);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(count);
        expect(Number((await prisma.waste.findUnique({ where: { id: roll.id } })).weightKg)).toBe(1.234567);
    });

    it('mantiene el peso sólo de consulta y permite editar otros datos y agregar stock', async () => {
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        for (const weightKg of [2.5, null, '']) {
            const rejected = await request(app).patch(`/wastes/${roll.id}`).send({ name: 'Cambio rechazado', isActive: true, maxUnitCost: 10, weightKg }).expect(400);
            expect(rejected.body.errors.weightKg.code).toBe('WASTE_WEIGHT_READ_ONLY');
            expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(before);
        }
        await request(app).patch(`/wastes/${roll.id}`).send({ name: roll.name, isActive: true, maxUnitCost: 12 }).expect(200);
        await request(app).post(`/wastes/${roll.id}/stock-entries`).send({ quantity: 2, weightKg: 99 }).expect(200);
        const persisted = await prisma.waste.findUnique({ where: { id: roll.id } });
        expect(Number(persisted.weightKg)).toBe(1.234567);
        expect(Number(persisted.maxUnitCost)).toBe(12);
        expect(Number(persisted.currentStock)).toBe(5);
    });

    it('rechaza peso para una presentación distinta de Rollo al crear o editar, incluso si el cliente fuerza el campo', async () => {
        const response = await request(app).post('/wastes').send({ ...createBody('sheet'), weightKg: 1 }).expect(400);
        expect(response.body.code).toBe('WASTE_WEIGHT_INVALID');
        const created = await request(app).post('/wastes').send(createBody('sheet')).expect(200);
        await request(app).patch(`/wastes/${created.body.waste.id}`).send({ name: created.body.waste.name, isActive: true, maxUnitCost: 10, weightKg: 1 }).expect(400);
        expect((await prisma.waste.findUnique({ where: { id: created.body.waste.id } })).weightKg).toBeNull();
    });

    it.each([0, -1, 'abc', '100000000', '0.0000001'])('rechaza peso inválido %s al registrar sin crear datos parciales', async weightKg => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        await request(app).post('/wastes').send({ ...createBody('roll'), height: 8, weightKg }).expect(400);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it.each(['1abc', '1e3', '1,25', 'Infinity', '1\n', true, [1], { value: 1 }])('rechaza el tipo o formato %s sin persistir merma, ajustes ni movimientos', async weightKg => {
        const before = await Promise.all([
            prisma.waste.count({ where: { supplierId: ids.supplier } }),
            prisma.wasteStockAdjustment.count({ where: { createdById: ids.user } }),
            prisma.wasteMovementDetail.count({ where: { waste: { supplierId: ids.supplier } } })
        ]);
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), height: 8, weightKg }).expect(400);
        expect(response.body.errors.weightKg.code).toBe('WEIGHT_KG_INVALID_NUMBER');
        expect(await Promise.all([
            prisma.waste.count({ where: { supplierId: ids.supplier } }),
            prisma.wasteStockAdjustment.count({ where: { createdById: ids.user } }),
            prisma.wasteMovementDetail.count({ where: { waste: { supplierId: ids.supplier } } })
        ])).toEqual(before);
    });

    it('el servicio protege también las llamadas directas con peso mal formado', async () => {
        const { createWasteWithInitialStockAdjustment } = await import('../../../src/services/warehouse/wastes/wasteService.js');
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        for (const weightKg of [true, [1], '1abc', '1e3', Infinity, NaN]) {
            await expect(createWasteWithInitialStockAdjustment({
                wasteDto: { ...createBody('roll'), height: 8, weightKg }, userId: ids.user
            })).rejects.toMatchObject({ code: 'WASTE_WEIGHT_INVALID' });
        }
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it('rechaza la modificación del peso también al invocar directamente el servicio', async () => {
        const { updateWaste } = await import('../../../src/services/warehouse/wastes/wasteService.js');
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        await expect(updateWaste({ id: roll.id, wasteDto: { weightKg: 7 } })).rejects.toMatchObject({ code: 'WASTE_WEIGHT_READ_ONLY' });
        expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(before);
    });

    it('exporta peso total de rollos con diferentes largos usando el peso de cada identidad', async () => {
        await request(app).post('/wastes').send({ ...createBody('roll'), height: 6, newStock: 2, weightKg: 3 }).expect(200);
        const before = await prisma.waste.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } });
        const response = await request(app).get('/waste-report').query({ supplierId: ids.supplier }).buffer(true).parse((res, callback) => {
            const chunks = []; res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(chunks)));
        }).expect(200);
        const workbook = XLSX.read(response.body, { type: 'buffer' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Mermas, { header: 1 });
        expect(rows[0][6]).toBe('Peso total de rollos (kg)');
        const group = rows.find(row => row[1] === roll.name);
        expect(group[6]).toBe(12.172835);
        expect(workbook.Sheets.Mermas[`G${rows.length}`].f).toMatch(/^SUM/);
        expect(await prisma.waste.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } })).toEqual(before);
    });

    it.each([0.000001, '99999999.999999'])('persiste exactamente el límite válido de peso %s', async weightKg => {
        const response = await request(app).post('/wastes').send({
            ...createBody('roll'), height: weightKg === 0.000001 ? 10 : 12, newStock: 0, weightKg
        }).expect(200);
        const persisted = await prisma.waste.findUnique({ where: { id: response.body.waste.id } });
        expect(Number(persisted.weightKg)).toBe(Number(weightKg));
        expect(Number(persisted.currentStock)).toBe(0);
        expect(Number(persisted.convertedQuantity)).toBe(0);
    });

    it('conserva como desconocido el peso no capturado, sin inferirlo de las medidas', async () => {
        const created = await request(app).post('/wastes').send({ ...createBody('roll'), height: 4 }).expect(200);
        expect((await prisma.waste.findUnique({ where: { id: created.body.waste.id } })).weightKg).toBeNull();
        const response = await request(app).get('/waste-report').query({ supplierId: ids.supplier }).buffer(true).parse((res, callback) => {
            const chunks = []; res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(chunks)));
        }).expect(200);
        const workbook = XLSX.read(response.body, { type: 'buffer' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Mermas, { header: 1 });
        expect(rows.find(row => row[1] === roll.name)[6]).toBe('Sin peso capturado');
        expect(rows.at(-1)[6]).toBe('Sin peso capturado');
    });
});
