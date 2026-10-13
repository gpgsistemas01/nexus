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
        const referenceController = await import('../../../src/controllers/api/warehouse/wasteRollReferenceController.js');
        const { wasteRollReferenceValidation } = await import('../../../src/validators/forms/wasteRollReferenceValidations.js');
        const reportController = await import('../../../src/controllers/api/warehouse/reportController.js');
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => { req.user = { id: ids.user, permissions: [] }; next(); });
            router.patch('/roll-reference', wasteRollReferenceValidation, validate, referenceController.updateWasteRollReference);
            router.get('/roll-reference', referenceController.getWasteRollReference);
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
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: '0.25', totalWeightKg: '1.48' }).expect(200);
        roll = response.body.waste;
        const persisted = await prisma.waste.findUnique({ where: { id: roll.id } });
        expect(Number(persisted.weightKg)).toBe(1.23);
        expect(Number(persisted.coneWeightKg)).toBe(0.25);
        expect(Number(persisted.totalWeightKg)).toBe(1.48);
        expect(Number(persisted.currentStock)).toBe(3);
        expect(Number(persisted.convertedQuantity)).toBe(9);
        const list = await request(app).get('/wastes').query({ supplierId: ids.supplier }).expect(200);
        expect(Number(list.body.data[0].weightKg)).toBe(1.23);
    });

    it('rechaza duplicados exactos y permite iguales medidas con pesos distintos', async () => {
        const count = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const duplicate = await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: 0.25, totalWeightKg: 1.48 }).expect(409);
        expect(duplicate.body.meta.waste.id).toBe(roll.id);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(count);
        await request(app).post('/wastes').send({ ...createBody('roll'), coneWeightKg: 1, totalWeightKg: 10, newStock: 1 }).expect(200);
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(count + 1);
        expect(Number((await prisma.waste.findUnique({ where: { id: roll.id } })).weightKg)).toBe(1.23);
    });

    it('mantiene el peso sólo de consulta y permite editar otros datos y agregar stock', async () => {
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        for (const field of ['weightKg', 'coneWeightKg', 'totalWeightKg']) {
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
        const response = await request(app).post('/wastes').send({ ...createBody('sheet'), coneWeightKg: 0, totalWeightKg: 1 }).expect(400);
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

    it.each(['100.01', 101])('rechaza peso %s mayor de 100 kg sin cambiar persistencia', async weightKg => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), height: 8, coneWeightKg: 0, totalWeightKg: weightKg }).expect(400);
        expect(response.body.errors.totalWeightKg.code).toBe('WEIGHT_KG_TOO_HIGH');
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it('el servicio rechaza DTOs no numéricos o no positivos con el error de dominio', async () => {
        const { createWasteWithInitialStockAdjustment } = await import('../../../src/services/warehouse/wastes/wasteService.js');
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        for (const weightKg of [true, [1], '1abc', '1e3', Infinity, NaN, 0, -1]) {
            await expect(createWasteWithInitialStockAdjustment({
                wasteDto: { ...createBody('roll'), height: 8, coneWeightKg: 0, totalWeightKg: weightKg }, userId: ids.user
            })).rejects.toMatchObject({ code: 'WASTE_WEIGHT_INVALID' });
        }
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it('rechaza la modificación del peso también al invocar directamente el servicio', async () => {
        const { updateWaste } = await import('../../../src/services/warehouse/wastes/wasteService.js');
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        for (const field of ['weightKg', 'coneWeightKg', 'totalWeightKg']) {
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

    it.each([0.01, '100'])('persiste exactamente el límite válido de peso %s', async weightKg => {
        const response = await request(app).post('/wastes').send({
            ...createBody('roll'), height: weightKg === 0.01 ? 10 : 12, newStock: 0, coneWeightKg: 0, totalWeightKg: weightKg
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

    it('rechaza estimar longitud sin pesos antes de escribir existencias', async () => {
        const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
        const response = await request(app).post('/wastes').send({ ...createBody('roll'), lengthSource: 'ESTIMATED' }).expect(400);
        expect(response.body.errors.lengthSource.code).toBe('WASTE_ESTIMATED_LENGTH_NEEDS_WEIGHTS');
        expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
    });

    it('guarda la referencia fija en material/proveedor y conserva las mermas anteriores', async () => {
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        const updated = await request(app).patch('/roll-reference').send({ supplierId: ids.supplier, materialId: ids.roll, coneWeightMode: 'FIXED', referenceConeWeightKg: '0.25', referenceRollTotalWeightKg: '2.25' }).expect(200);
        expect(Number(updated.body.reference.referenceRollNetWeightKg)).toBe(2);
        expect(updated.body.reference.referenceLengthM).toBe(20);
        expect(updated.body.reference.referenceWidthM).toBe(1.5);
        expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(before);
        const created = await request(app).post('/wastes').send({ ...createBody('roll'), name: 'IT Referencia fija', newStock: 1, coneWeightKg: 0.1, totalWeightKg: 1.25, useConeReference: true, lengthSource: 'ESTIMATED', height: 999 }).expect(200);
        const saved = await prisma.waste.findUnique({ where: { id: created.body.waste.id } });
        expect(Number(saved.coneWeightKg)).toBe(0.25);
        expect(Number(saved.weightKg)).toBe(1);
        expect(Number(saved.height)).toBe(10);
        expect(Number(saved.convertedQuantity)).toBe(15);
        expect(saved.coneWeightSource).toBe('FIXED_REFERENCE');
        expect(saved.lengthSource).toBe('ESTIMATED');
        expect(saved.sourceMaterialId).toBe(ids.roll);
        await request(app).patch('/roll-reference').send({ supplierId: ids.supplier, materialId: ids.roll, coneWeightMode: 'VARIABLE', referenceConeWeightKg: '0.3', referenceRollTotalWeightKg: '2.3' }).expect(200);
        expect(await prisma.waste.findUnique({ where: { id: saved.id } })).toEqual(saved);
    });

    it('conserva cono medido distinto de la referencia variable y estima según el ancho de la merma', async () => {
        const created = await request(app).post('/wastes').send({ ...createBody('roll'), name: 'IT Cono variable', base: 0.75, newStock: 1, coneWeightKg: 0.4, totalWeightKg: 1.4, lengthSource: 'ESTIMATED', height: 999 }).expect(200);
        const saved = await prisma.waste.findUnique({ where: { id: created.body.waste.id } });
        expect(Number(saved.referenceConeWeightKg)).toBe(0.3);
        expect(Number(saved.coneWeightKg)).toBe(0.4);
        expect(saved.coneWeightSource).toBe('MEASURED');
        expect(Number(saved.weightKg)).toBe(1);
        expect(Number(saved.height)).toBe(20);
        expect(Number(saved.convertedQuantity)).toBe(15);
    });

    it('marca el uso de una referencia variable como estimado', async () => {
        const created = await request(app).post('/wastes').send({ ...createBody('roll'), name: 'IT Cono estimado', newStock: 1, coneWeightKg: 0.3, totalWeightKg: 1.3, useConeReference: true }).expect(200);
        expect(created.body.waste.coneWeightSource).toBe('ESTIMATED_REFERENCE');
        expect(Number(created.body.waste.referenceConeWeightKg)).toBe(0.3);
    });

    it.each([
        [{ coneWeightMode: 'FIXED' }, 'referenceConeWeightKg'],
        [{ coneWeightMode: 'OTRO' }, 'coneWeightMode'],
        [{ coneWeightMode: 'VARIABLE', referenceConeWeightKg: -1 }, 'referenceConeWeightKg'],
        [{ coneWeightMode: 'VARIABLE', referenceConeWeightKg: 1, referenceRollTotalWeightKg: 1 }, 'referenceRollTotalWeightKg']
    ])('rechaza referencias inválidas sin modificar la relación: %s', async (data, field) => {
        const before = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: ids.roll } } });
        const response = await request(app).patch('/roll-reference').send({ supplierId: ids.supplier, materialId: ids.roll, ...data }).expect(400);
        expect(response.body.errors[field]).toBeDefined();
        expect(await prisma.supplierMaterial.findUnique({ where: { id: before.id } })).toEqual(before);
    });

});
