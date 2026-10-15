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
    base: 1.5, height: 2, ...(resource === 'sheet' ? {} : { referenceRollTotalWeightKg: 2.25 }), maxUnitCost: 10, newStock: 3, minStock: 0, isActive: true
});

describe('peso unitario de merma de rollo', () => {
    beforeAll(async () => {
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        const controller = await import('../../../src/controllers/api/warehouse/wasteController.js');
        const materialController = await import('../../../src/controllers/api/warehouse/materialController.js');
        const { materialEditValidation, materialValidation } = await import('../../../src/validators/forms/materialValidations.js');
        const reportController = await import('../../../src/controllers/api/warehouse/reportController.js');
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => { req.user = { id: ids.user, permissions: [] }; next(); });
            router.patch('/materials/:id', materialEditValidation, validate, materialController.editMaterial);
            router.post('/materials', materialValidation, validate, materialController.registerMaterial);
            router.get('/wastes/material-templates', controller.getWasteMaterialTemplates);
            router.get('/wastes', controller.getAllWastes);
            router.get('/waste-report', reportController.exportWasteReportExcel);
            router.post('/wastes', wasteValidation, validate, controller.registerWaste);
            router.patch('/wastes/:id', wasteEditValidation, validate, controller.editWaste);
            router.post('/wastes/:id/stock-entries', wasteStockAdditionValidation, validate, controller.registerWasteStockAddition);
        } });
        await prisma.stockAdjustmentReason.upsert({ where: { name: 'Stock inicial' }, update: {}, create: { name: 'Stock inicial' } });
        ids.user = (await prisma.user.create({ data: { name: `IT Weight User ${suffix}`, password: 'integration-only' } })).id;
        ids.unit = (await prisma.unitMeasure.create({ data: { name: 'METRO CUADRADO', symbol: `k${suffix}` } })).id;
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
            await prisma.supplierMaterial.create({ data: { supplierId: ids.supplier, materialId: ids[resource], maxUnitCost: 10, ...(resource === 'roll' ? { referenceConeWeightKg: 0.25, referenceRollTotalWeightKg: 12.55 } : {}) } });
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
        const materialAdjustments = await prisma.stockAdjustment.findMany({ where: { createdById: ids.user }, select: { id: true } });
        const materialAdjustmentIds = materialAdjustments.map(row => row.id);
        await prisma.movementDetail.deleteMany({ where: { stockAdjustmentDetail: { stockAdjustmentId: { in: materialAdjustmentIds } } } });
        await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: materialAdjustmentIds } } });
        await prisma.stockAdjustmentDetail.deleteMany({ where: { stockAdjustmentId: { in: materialAdjustmentIds } } });
        await prisma.stockAdjustment.deleteMany({ where: { id: { in: materialAdjustmentIds } } });
        await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
        await prisma.material.deleteMany({ where: { id: { in: [ids.roll, ids.sheet, ids.extraRoll, ids.referenceRoll, ids.concurrentRoll].filter(Boolean) } } });
        await prisma.supplier.delete({ where: { id: ids.supplier } });
        await prisma.user.delete({ where: { id: ids.user } });
        await prisma.unitMeasure.delete({ where: { id: ids.unit } });
        await prisma.presentation.delete({ where: { id: ids.sheetPresentation } });
    });

    it('devuelve el origen sin precargar referencias históricas del rollo completo', async () => {
        const response = await request(app).get('/wastes/material-templates').query({ supplierId: ids.supplier }).expect(200);
        const template = response.body.data.find(item => item.id === ids.roll);
        expect(template).toBeDefined();
        expect(Number(template.base)).toBe(1.5);
        expect(template.supplierMaterials[0]).not.toHaveProperty('referenceConeWeightKg');
        expect(template.supplierMaterials[0]).not.toHaveProperty('referenceRollTotalWeightKg');
        expect(template).not.toHaveProperty('referenceConeWeightKg');
        expect(template).not.toHaveProperty('referenceRollTotalWeightKg');
    });

    it('registra peso en kg por unidad y lo devuelve al consultar sin cambiar el cálculo de existencia', async () => {
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: '0.25', totalWeightKg: '1.48' }).expect(200);
        roll = response.body.waste;
        const persisted = await prisma.waste.findUnique({ where: { id: roll.id } });
        expect(Number(persisted.weightKg)).toBe(1.23);
        expect(Number(roll.weightKg)).toBe(1.23);
        expect(Number(persisted.coneWeightKg)).toBe(0.25);
        expect(Number(persisted.totalWeightKg)).toBe(1.48);
        expect(Number(persisted.currentStock)).toBe(3);
        expect(Number(persisted.convertedQuantity)).toBe(55.35);
        const list = await request(app).get('/wastes').query({ supplierId: ids.supplier }).expect(200);
        expect(Number(list.body.data[0].weightKg)).toBe(1.23);
    });

    it('rechaza duplicados exactos y permite iguales medidas con pesos distintos', async () => {
        const count = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const previous = await prisma.waste.findUnique({ where: { id: roll.id } });
        const movements = await prisma.wasteMovementDetail.count({ where: { wasteId: roll.id } });
        const duplicate = await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: 0.25, totalWeightKg: 1.48 }).expect(409);
        expect(duplicate.body.meta.waste.id).toBe(roll.id);
        expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(previous);
        expect(await prisma.wasteMovementDetail.count({ where: { wasteId: roll.id } })).toBe(movements);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(count);
        await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: 1, totalWeightKg: 10, newStock: 1 }).expect(200);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(count + 1);
        expect(Number((await prisma.waste.findUnique({ where: { id: roll.id } })).weightKg)).toBe(1.23);
    });

    it('mantiene el peso sólo de consulta y permite editar otros datos y agregar stock', async () => {
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        for (const field of ['weightKg', 'coneWeightKg', 'totalWeightKg', 'referenceRollTotalWeightKg']) {
          for (const weightKg of [2.5, null, '']) {
            const rejected = await request(app).patch(`/wastes/${roll.id}`).send({ name: 'Cambio rechazado', isActive: true, maxUnitCost: 10, [field]: weightKg }).expect(400);
            expect(rejected.body.errors[field].code).toBe('WASTE_WEIGHT_READ_ONLY');
            expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(before);
        }
        }
        await request(app).patch(`/wastes/${roll.id}`).send({ name: roll.name, isActive: true, maxUnitCost: 12 }).expect(200);
        await request(app).post(`/wastes/${roll.id}/stock-entries`).send({ quantity: 2, weightKg: 99 }).expect(200);
        const persisted = await prisma.waste.findUnique({ where: { id: roll.id } });
        expect(Number(persisted.weightKg)).toBe(1.23);
        expect(Number(persisted.maxUnitCost)).toBe(12);
        expect(Number(persisted.currentStock)).toBe(5);
    });

    it('rechaza peso para una presentación distinta de Rollo al crear o editar, incluso si el cliente fuerza el campo', async () => {
        const response = await request(app).post('/wastes').send({ ...createBody('sheet'), referenceRollTotalWeightKg: 2.25, coneWeightKg: 0, totalWeightKg: 1 }).expect(400);
        expect(response.body.code).toBe('WASTE_WEIGHT_INVALID');
        const created = await request(app).post('/wastes').send(createBody('sheet')).expect(200);
        await request(app).patch(`/wastes/${created.body.waste.id}`).send({ name: created.body.waste.name, isActive: true, maxUnitCost: 10, weightKg: 1 }).expect(400);
        expect((await prisma.waste.findUnique({ where: { id: created.body.waste.id } })).weightKg).toBeNull();
    });

    it.each([0, -1, 'abc', '100000000', '0.001'])('rechaza peso inválido %s al registrar sin crear datos parciales', async weightKg => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        await request(app).post('/wastes').send({ ...createBody('roll'), height: 8, coneWeightKg: 0, totalWeightKg: weightKg }).expect(400);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it.each(['1abc', '1e3', '1,25', 'Infinity', '1\n', true, [1], { value: 1 }])('rechaza el tipo o formato %s sin persistir merma, ajustes ni movimientos', async weightKg => {
        const before = await Promise.all([
            prisma.waste.count({ where: { supplierId: ids.supplier } }),
            prisma.wasteStockAdjustment.count({ where: { createdById: ids.user } }),
            prisma.wasteMovementDetail.count({ where: { waste: { supplierId: ids.supplier } } })
        ]);
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), height: 8, coneWeightKg: 0, totalWeightKg: weightKg }).expect(400);
        expect(response.body.errors.totalWeightKg.code).toBe('WEIGHT_KG_INVALID_NUMBER');
        expect(await Promise.all([
            prisma.waste.count({ where: { supplierId: ids.supplier } }),
            prisma.wasteStockAdjustment.count({ where: { createdById: ids.user } }),
            prisma.wasteMovementDetail.count({ where: { waste: { supplierId: ids.supplier } } })
        ])).toEqual(before);
    });

    it.each(['999.991', 1000])('rechaza peso %s mayor de 999.99 kg sin cambiar persistencia', async weightKg => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), height: 8, coneWeightKg: 0, totalWeightKg: weightKg }).expect(400);
        expect(response.body.errors.totalWeightKg.code).toBe('WEIGHT_KG_TOO_HIGH');
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });


    it('rechaza la modificación del peso también al invocar directamente el servicio', async () => {
        const { updateWaste } = await import('../../../src/services/warehouse/wastes/wasteService.js');
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        for (const field of ['weightKg', 'coneWeightKg', 'totalWeightKg', 'referenceRollTotalWeightKg']) {
            await expect(updateWaste({ id: roll.id, wasteDto: { [field]: 7 } })).rejects.toMatchObject({ code: 'WASTE_WEIGHT_READ_ONLY' });
        }
        expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(before);
    });

    it('exporta peso total de rollos con diferentes largos usando el peso de cada identidad', async () => {
        await request(app).post('/wastes').send({ ...createBody('roll'), height: 6, newStock: 2, coneWeightKg: 1, totalWeightKg: 4 }).expect(200);
        const before = await prisma.waste.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } });
        const response = await request(app).get('/waste-report').query({ supplierId: ids.supplier }).buffer(true).parse((res, callback) => {
            const chunks = []; res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(chunks)));
        }).expect(200);
        const workbook = XLSX.read(response.body, { type: 'buffer' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Mermas, { header: 1 });
        expect(rows[0][6]).toBe('Peso neto total de rollos (kg)');
        const group = rows.find(row => row[1] === roll.name);
        expect(group[6]).toBe(21.15);
        expect(workbook.Sheets.Mermas[`G${rows.length}`].f).toMatch(/^SUM/);
        expect(await prisma.waste.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } })).toEqual(before);
    });

    it.each([0.01, '999.99'])('persiste exactamente el límite válido de peso %s', async weightKg => {
        const response = await request(app).post('/wastes').send({
            ...createBody('roll'), height: weightKg === 0.01 ? 10 : 12, newStock: 0, coneWeightKg: 0, totalWeightKg: weightKg
        }).expect(200);
        const persisted = await prisma.waste.findUnique({ where: { id: response.body.waste.id } });
        expect(Number(persisted.weightKg)).toBe(Number(weightKg));
        expect(Number(persisted.currentStock)).toBe(0);
        expect(Number(persisted.convertedQuantity)).toBe(0);
    });

    it('conserva como desconocido el peso no capturado, sin inferirlo de las medidas', async () => {
        const created = await request(app).post('/wastes').send({ ...createBody('roll'), referenceRollTotalWeightKg: undefined, height: 4 }).expect(200);
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
    it.each([
        [{ totalWeightKg: 2 }, 'coneWeightKg', 'CONE_WEIGHT_KG_REQUIRED'],
        [{ coneWeightKg: 0 }, 'totalWeightKg', 'TOTAL_WEIGHT_KG_REQUIRED'],
        [{ coneWeightKg: -1, totalWeightKg: 2 }, 'coneWeightKg', 'CONE_WEIGHT_KG_INVALID_NUMBER'],
        [{ coneWeightKg: 2, totalWeightKg: 2 }, 'totalWeightKg', 'WASTE_TOTAL_WEIGHT_NOT_GREATER'],
        [{ coneWeightKg: 3, totalWeightKg: 2 }, 'totalWeightKg', 'WASTE_TOTAL_WEIGHT_NOT_GREATER'],
        [{ weightKg: 1, coneWeightKg: 0, totalWeightKg: 2 }, 'weightKg', 'WASTE_WEIGHT_CALCULATED']
    ])('rechaza captura incompleta o incoherente sin merma ni movimiento: %s', async (weights, field, code) => {
        const before = await Promise.all([
            prisma.waste.count({ where: { supplierId: ids.supplier } }),
            prisma.wasteStockAdjustment.count({ where: { createdById: ids.user } }),
            prisma.wasteMovementDetail.count({ where: { waste: { supplierId: ids.supplier } } })
        ]);
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), height: 15, ...weights }).expect(400);
        expect(response.body.errors[field].code).toBe(code);
        expect(await Promise.all([
            prisma.waste.count({ where: { supplierId: ids.supplier } }),
            prisma.wasteStockAdjustment.count({ where: { createdById: ids.user } }),
            prisma.wasteMovementDetail.count({ where: { waste: { supplierId: ids.supplier } } })
        ])).toEqual(before);
    });


    const materialEditBody = (resource = 'roll') => ({ supplierId: ids.supplier, name: `IT Weight ${resource} ${suffix}`, maxUnitCost: 10, isActive: true });

    it('rechaza una merma sin pesos ni dimensión longitudinal sin crear registros parciales', async () => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), referenceRollTotalWeightKg: undefined, base: undefined, height: undefined }).expect(400);
        expect(response.body.code).toBe('WASTE_DIMENSIONS_INVALID');
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it('registra el peso del rollo completo desde merma y obtiene sus metros del material', async () => {
        const material = await request(app).post('/materials').send({
            ...materialEditBody('referenceRoll'), presentationId: ids.rollPresentation, unitMeasureId: ids.unit,
            base: 1.5, height: 20, newStock: 0
        }).expect(200);
        ids.referenceRoll = material.body.material.material.id;
        const before = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: ids.referenceRoll } } });
        expect(before.referenceConeWeightKg).toBeNull();
        expect(before.referenceRollTotalWeightKg).toBeNull();
        const created = await request(app).post('/wastes').send({ ...createBody('referenceRoll'), name: 'IT Muestra propia', newStock: 1,
            referenceRollTotalWeightKg: 2.25, coneWeightKg: 0.25, totalWeightKg: 1.25, height: 999 }).expect(200);
        const saved = await prisma.waste.findUnique({ where: { id: created.body.waste.id } });
        expect(Number(saved.sampleLengthM)).toBe(20);
        expect(Number(saved.sampleNetWeightKg)).toBe(2);
        expect(Number(saved.referenceRollTotalWeightKg)).toBe(2.25);
        expect(Number(saved.height)).toBe(10);
        expect(Number(saved.weightKg)).toBe(1);
        expect(Number(saved.convertedQuantity)).toBe(15);
        expect(saved.sourceMaterialId).toBe(ids.referenceRoll);
        expect(await prisma.supplierMaterial.findUnique({ where: { id: before.id } })).toEqual(before);
        for (const field of ['sampleLengthM', 'sampleNetWeightKg', 'referenceRollTotalWeightKg']) {
            const response = await request(app).patch(`/wastes/${saved.id}`).send({ name: saved.name, minStock: 0, maxUnitCost: 10, isActive: true, [field]: 9 }).expect(400);
            expect(response.body.errors[field].code).toBe('WASTE_WEIGHT_READ_ONLY');
        }
        expect(await prisma.waste.findUnique({ where: { id: saved.id } })).toEqual(saved);
    });

    it.each([
        [{ referenceRollTotalWeightKg: undefined }, 'referenceRollTotalWeightKg', 'REFERENCE_ROLL_TOTAL_WEIGHT_REQUIRED'],
        [{ referenceRollTotalWeightKg: 0 }, 'referenceRollTotalWeightKg', 'WEIGHT_KG_INVALID_NUMBER'],
        [{ referenceRollTotalWeightKg: 0.25 }, 'referenceRollTotalWeightKg', 'REFERENCE_ROLL_TOTAL_WEIGHT_NOT_GREATER'],
        [{ referenceRollTotalWeightKg: '2.001' }, 'referenceRollTotalWeightKg', 'WEIGHT_KG_TOO_LONG'],
        [{ sampleLengthM: 999 }, 'sampleLengthM', 'WASTE_WEIGHT_CALCULATED'],
        [{ sampleNetWeightKg: 999 }, 'sampleNetWeightKg', 'WASTE_WEIGHT_CALCULATED']
    ])('rechaza referencias inválidas o resultados forzados sin efectos parciales: %j', async (reference, field, code) => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: 0.25, totalWeightKg: 1.25, ...reference }).expect(400);
        expect(response.body.errors[field].code).toBe(code);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it('conserva las muestras anteriores sin inferir un peso del rollo completo', async () => {
        const saved = await prisma.waste.create({ data: { name: 'IT Muestra histórica', supplierId: ids.supplier,
            presentationId: ids.rollPresentation, unitMeasureId: ids.unit, base: 1.5, height: 17.54386,
            coneWeightKg: 0, totalWeightKg: 1, weightKg: 1, sampleLengthM: 1, sampleNetWeightKg: 0.057 } });
        await request(app).patch(`/wastes/${saved.id}`).send({ name: saved.name, maxUnitCost: 10, isActive: true }).expect(200);
        const after = await prisma.waste.findUnique({ where: { id: saved.id } });
        expect(Number(after.sampleNetWeightKg)).toBe(0.057);
        expect(Number(after.sampleLengthM)).toBe(1);
        expect(Number(after.height)).toBe(17.54386);
        expect(after.referenceRollTotalWeightKg).toBeNull();
    });

    it('editar un costo conserva los pesos históricos del material', async () => {
        const before = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: ids.roll } } });
        await request(app).patch(`/materials/${ids.roll}`).send({ ...materialEditBody(), maxUnitCost: 12 }).expect(200);
        const after = await prisma.supplierMaterial.findUnique({ where: { id: before.id } });
        expect(after.referenceConeWeightKg).toEqual(before.referenceConeWeightKg);
        expect(after.referenceRollTotalWeightKg).toEqual(before.referenceRollTotalWeightKg);
        expect(Number(after.maxUnitCost)).toBe(12);
    });

    it('calcula base cuando el largo nominal está en base y agrupa el reporte por el ancho correcto', async () => {
        await prisma.material.update({ where: { id: ids.referenceRoll }, data: { base: 20, height: 1.5 } });
        try {
            const created = await request(app).post('/wastes').send({ ...createBody('referenceRoll'), name: 'IT Largo en base', referenceRollTotalWeightKg: 2.4, coneWeightKg: 0.4, totalWeightKg: 1.4, base: 999, height: 888, referenceRollNetWeightKg: 999 }).expect(200);
            const saved = await prisma.waste.findUnique({ where: { id: created.body.waste.id } });
            expect(Number(saved.base)).toBe(10);
            expect(Number(saved.height)).toBe(1.5);
            const { findWasteReportRows, buildWasteReportSummary } = await import('../../../src/services/warehouse/reportService.js');
            const report = await findWasteReportRows({ supplierId: ids.supplier });
            expect(buildWasteReportSummary(report).rows).toContainEqual(expect.objectContaining({ name: 'IT Largo en base', width: 1.5 }));
        } finally {
            await prisma.material.update({ where: { id: ids.referenceRoll }, data: { base: 1.5, height: 20 } });
        }
    });

    it('usa el cono capturado para el sobrante y el ancho del material', async () => {
        const created = await request(app).post('/wastes').send({ ...createBody('referenceRoll'), name: 'IT Cono editado', base: 0.75, newStock: 1, referenceRollTotalWeightKg: 2.4, coneWeightKg: 0.4, totalWeightKg: 1.4, height: 999 }).expect(200);
        const saved = await prisma.waste.findUnique({ where: { id: created.body.waste.id } });
        expect(Number(saved.coneWeightKg)).toBe(0.4);
        expect(Number(saved.weightKg)).toBe(1);
        expect(Number(saved.base)).toBe(1.5);
        expect(Number(saved.height)).toBe(10);
        expect(Number(saved.convertedQuantity)).toBe(15);
    });

    it.each([
        [{ referenceRollTotalWeightKg: 2 }, 'referenceRollTotalWeightKg'],
        [{ referenceConeWeightKg: -1 }, 'referenceConeWeightKg'],
        [{ referenceConeWeightKg: 1, referenceRollTotalWeightKg: 1 }, 'referenceRollTotalWeightKg']
    ])('rechaza pesos de material inválidos sin modificar la relación ni el material: %s', async (data, field) => {
        const before = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: ids.roll } } });
        const materialBefore = await prisma.material.findUnique({ where: { id: ids.roll } });
        const response = await request(app).patch(`/materials/${ids.roll}`).send({ ...materialEditBody(), ...data }).expect(400);
        expect(response.body.errors[field]).toBeDefined();
        expect(await prisma.supplierMaterial.findUnique({ where: { id: before.id } })).toEqual(before);
        expect(await prisma.material.findUnique({ where: { id: ids.roll } })).toEqual(materialBefore);
    });

    it('rechaza referencias de peso en otro tipo de presentación sin escrituras parciales', async () => {
        const before = await prisma.material.findUnique({ where: { id: ids.sheet } });
        await request(app).patch(`/materials/${ids.sheet}`).send({ ...materialEditBody(), name: 'Cambio rechazado', referenceConeWeightKg: 0.2, referenceRollTotalWeightKg: 2 }).expect(400);
        expect(await prisma.material.findUnique({ where: { id: ids.sheet } })).toEqual(before);
    });

    it('rechaza borrar las referencias de material y conserva el material y las mermas existentes', async () => {
        const before = await prisma.waste.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } });
        const rejected = await request(app).patch(`/materials/${ids.roll}`).send({ ...materialEditBody(), referenceConeWeightKg: null, referenceRollTotalWeightKg: null }).expect(400);
        expect(rejected.body.errors.referenceConeWeightKg.code).toBe('MATERIAL_ROLL_REFERENCE_READ_ONLY');
        const offer = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: ids.roll } } });
        expect(Number(offer.referenceConeWeightKg)).toBe(0.25);
        expect(Number(offer.referenceRollTotalWeightKg)).toBe(12.55);
        expect(await prisma.waste.findMany({ where: { supplierId: ids.supplier }, orderBy: { id: 'asc' } })).toEqual(before);
        const count = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const previous = await prisma.waste.findUnique({ where: { id: roll.id } });
        const movements = await prisma.wasteMovementDetail.count({ where: { wasteId: roll.id } });
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(count);
        expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(previous);
        expect(await prisma.wasteMovementDetail.count({ where: { wasteId: roll.id } })).toBe(movements);
    });
});
