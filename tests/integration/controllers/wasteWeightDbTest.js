import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

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
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => { req.user = { id: ids.user, permissions: [] }; next(); });
            router.get('/wastes', controller.getAllWastes);
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

    it('permite corregir el peso de la identidad y agregar stock sin alterar ese peso', async () => {
        await request(app).patch(`/wastes/${roll.id}`).send({ name: roll.name, isActive: true, maxUnitCost: 10, weightKg: 2.5 }).expect(200);
        await request(app).post(`/wastes/${roll.id}/stock-entries`).send({ quantity: 2, weightKg: 99 }).expect(200);
        const persisted = await prisma.waste.findUnique({ where: { id: roll.id } });
        expect(Number(persisted.weightKg)).toBe(2.5);
        expect(Number(persisted.currentStock)).toBe(5);
    });

    it('rechaza peso para una presentación distinta de Rollo al crear o editar, incluso si el cliente fuerza el campo', async () => {
        const response = await request(app).post('/wastes').send({ ...createBody('sheet'), weightKg: 1 }).expect(400);
        expect(response.body.code).toBe('WASTE_WEIGHT_INVALID');
        const created = await request(app).post('/wastes').send(createBody('sheet')).expect(200);
        await request(app).patch(`/wastes/${created.body.waste.id}`).send({ name: created.body.waste.name, isActive: true, maxUnitCost: 10, weightKg: 1 }).expect(400);
        expect((await prisma.waste.findUnique({ where: { id: created.body.waste.id } })).weightKg).toBeNull();
    });

    it.each([0, -1, 'abc', '100000000', '0.0000001'])('rechaza peso inválido %s sin cambiar la identidad', async weightKg => {
        const before = await prisma.waste.findUnique({ where: { id: roll.id } });
        await request(app).patch(`/wastes/${roll.id}`).send({ name: roll.name, isActive: true, maxUnitCost: 10, weightKg }).expect(400);
        expect(await prisma.waste.findUnique({ where: { id: roll.id } })).toEqual(before);
    });

    it('conserva como desconocido el peso no capturado, sin inferirlo de las medidas', async () => {
        const created = await request(app).post('/wastes').send({ ...createBody('roll'), height: 4 }).expect(200);
        expect((await prisma.waste.findUnique({ where: { id: created.body.waste.id } })).weightKg).toBeNull();
    });
});
