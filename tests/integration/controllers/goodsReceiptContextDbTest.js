import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const suffix = Math.random().toString(36).slice(2, 8);
const ids = {};
const receipts = {};
let prisma;
let app;
let services;
const path = resource => `/goods-receipts/${resource === 'material' ? 'materials' : 'consumables'}`;

describe('compras con contexto coherente en cabecera y detalles', () => {
    beforeAll(async () => {
        prisma = (await import('../../../src/lib/prisma.js')).prisma;
        services = {
            material: await import('../../../src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js'),
            consumable: await import('../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js')
        };
        const controllers = {
            material: await import('../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js'),
            consumable: await import('../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js')
        };
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => { req.user = { id: null }; next(); });
            for (const [resource, label] of [['material', 'Material'], ['consumable', 'Consumable']]) {
                const controller = controllers[resource];
                router.get(path(resource), controller[`getAll${label}GoodsReceipts`]);
                router.patch(`${path(resource)}/:id`, controller[`edit${label}GoodsReceipt`]);
                router.patch(`${path(resource)}/:id/details/:detailId/corrections`, controller[`correct${label}GoodsReceiptDetail`]);
                router.patch(`${path(resource)}/:id/details/:detailId/cancel`, controller[`cancel${label}GoodsReceiptDetail`]);
            }
        } });
        ids.unit = (await prisma.unitMeasure.create({ data: { name: `RC unit ${suffix}`, symbol: `r${suffix}` } })).id;
        ids.presentation = (await prisma.presentation.create({ data: { name: `RC presentation ${suffix}` } })).id;
        ids.supplier = (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `RC${suffix}`,
            legalName: `RC legal ${suffix}`, tradeName: `RC supplier ${suffix}`
        } })).id;
        ids.person = (await prisma.person.create({ data: { fullName: `RC person ${suffix}` } })).id;
        ids.status = (await prisma.status.upsert({ where: { name: 'Aprobada' }, update: {}, create: { name: 'Aprobada' } })).id;
        for (const [resource, type] of [['material', 'MATERIAL'], ['consumable', 'CONSUMABLE']]) {
            ids[resource] = (await prisma.material.create({ data: {
                name: `RC ${resource} ${suffix}`, type, unitMeasureId: ids.unit, presentationId: ids.presentation
            } })).id;
            await prisma.supplierMaterial.create({ data: {
                materialId: ids[resource], supplierId: ids.supplier, maxUnitCost: 10, currentStock: 10, convertedQuantity: 10
            } });
        }
        for (const [key, type, resources] of [
            ['material', 'MATERIAL', ['material']], ['consumable', 'CONSUMABLE', ['consumable']],
            ['mixed', 'MATERIAL', ['material', 'consumable']], ['empty', 'MATERIAL', []]
        ]) {
            receipts[key] = await prisma.goodsReceipt.create({ data: {
                type, referenceNumber: `RC-${key}-${suffix}`, supplierId: ids.supplier, supplierName: `RC supplier ${suffix}`,
                receivedById: ids.person, receivedByName: `RC person ${suffix}`, statusId: ids.status,
                receptionDate: new Date('2026-10-07'), totalQuantity: resources.length * 2,
                totalNetPurchaseAmount: resources.length * 20, totalGrossPurchaseAmount: resources.length * 23.2,
                details: { create: resources.map(resource => ({
                    materialId: ids[resource], materialName: `RC ${resource} ${suffix}`, quantity: 2, convertedQuantity: 2,
                    costPerUnitType: 10, conversionUnitCost: 10, netPurchaseAmount: 20, grossPurchaseAmount: 23.2
                })) }
            }, include: { details: true } });
        }
    });

    afterAll(async () => {
        if (!prisma || !ids.supplier) return;
        const receiptIds = Object.values(receipts).map(receipt => receipt.id);
        await prisma.goodsReceiptDetail.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
        await prisma.goodsReceipt.deleteMany({ where: { id: { in: receiptIds } } });
        await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
        await prisma.material.deleteMany({ where: { id: { in: [ids.material, ids.consumable] } } });
        await prisma.supplier.delete({ where: { id: ids.supplier } });
        await prisma.person.delete({ where: { id: ids.person } });
        await prisma.presentation.delete({ where: { id: ids.presentation } });
        await prisma.unitMeasure.delete({ where: { id: ids.unit } });
    });

    it.each([['material', 'Material'], ['consumable', 'Consumable']])('lista y reporta solo compras homogéneas de %s', async (resource, label) => {
        const response = await request(app).get(path(resource)).query({ supplierId: ids.supplier }).expect(200);
        expect(response.body.data.map(receipt => receipt.id)).toEqual([receipts[resource].id]);
        expect(response.body.recordsFiltered).toBe(1);
        const rows = await services[resource][`find${label}GoodsReceiptReportRows`]({ supplierId: ids.supplier });
        expect(rows.map(row => row.referenceNumber)).toEqual([receipts[resource].referenceNumber]);
    });

    it.each(['material', 'consumable'])('permite editar una compra homogénea de %s', async resource => {
        const receipt = receipts[resource];
        await request(app).patch(`${path(resource)}/${receipt.id}`).send({
            supplierId: ids.supplier, receivedById: ids.person, receptionDate: '2026-10-07T00:00:00.000Z', observations: 'Contexto correcto', details: []
        }).expect(200);
        expect((await prisma.goodsReceipt.findUnique({ where: { id: receipt.id } })).observations).toBe('Contexto correcto');
    });

    it.each(['mixed', 'empty', 'consumable'])('rechaza editar %s desde materiales y conserva la cabecera', async key => {
        const receipt = receipts[key];
        await request(app).patch(`${path('material')}/${receipt.id}`).send({
            supplierId: ids.supplier, receivedById: ids.person, receptionDate: '2026-10-07T00:00:00.000Z', observations: 'No debe persistir', details: []
        }).expect(404);
        expect((await prisma.goodsReceipt.findUnique({ where: { id: receipt.id } })).observations)
            .toBe(key === 'consumable' ? 'Contexto correcto' : null);
    });

    it.each(['corrections', 'cancel'])('rechaza %s de ambos detalles de una compra mixta sin efectos', async operation => {
        const before = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { materialId: 'asc' } });
        for (const detail of receipts.mixed.details) {
            await request(app).patch(`${path('material')}/${receipts.mixed.id}/details/${detail.id}/${operation}`)
                .send({ quantity: 1, costPerUnitType: 10 }).expect(404);
        }
        expect(await prisma.goodsReceiptDetailChange.count({ where: { goodsReceiptId: receipts.mixed.id } })).toBe(0);
        expect(await prisma.inventoryMovement.count({ where: { goodsReceiptId: receipts.mixed.id } })).toBe(0);
        expect(await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { materialId: 'asc' } })).toEqual(before);
    });
});
