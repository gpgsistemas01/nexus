import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { readExcelReport } from '../../helpers/readExcelReport.js';
import { withPiecePresentation } from '../../helpers/withPiecePresentation.js';

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
        const { getAllMaterials, removeMaterial } = await import('../../../src/controllers/api/warehouse/materialController.js');
        const { editCatalogEntry } = await import('../../../src/controllers/api/admin/catalogController.js');
        const { getAllConsumables } = await import('../../../src/controllers/api/warehouse/consumableController.js');
        const report = await import('../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportController.js');
        app = createControllerTestApp({ registerRoutes: router => {
            router.use((req, _res, next) => { req.user = { id: ids.user, permissions: ['materials:write'] }; next(); });
            router.get('/catalog/material', getAllMaterials);
            router.put('/articles/:catalog/:id', editCatalogEntry);
            router.delete('/catalog/material/:id', removeMaterial);
            router.get('/catalog/consumable', getAllConsumables);
            router.get('/purchase-report', report.exportMaterialGoodsReceiptReportExcel);
            for (const [resource, label] of [['material', 'Material'], ['consumable', 'Consumable']]) {
                const controller = controllers[resource];
                router.get(`${path(resource)}/:id`, controller[`get${label}GoodsReceipt`]);
                router.get(path(resource), controller[`getAll${label}GoodsReceipts`]);
                router.post(path(resource), controller[`register${label}GoodsReceipt`]);
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
        ids.user = (await prisma.user.create({ data: { name: `RC user ${suffix}`, password: 'integration-only' } })).id;
        ids.person = (await prisma.person.create({ data: { fullName: `RC person ${suffix}` } })).id;
        ids.status = (await prisma.status.upsert({ where: { name: 'Aprobada' }, update: {}, create: { name: 'Aprobada' } })).id;
        await prisma.status.upsert({ where: { name: 'Confirmada' }, update: {}, create: { name: 'Confirmada' } });
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
        const receiptIds = (await prisma.goodsReceipt.findMany({ where: { supplierId: ids.supplier }, select: { id: true } }))
            .map(receipt => receipt.id);
        const movements = await prisma.inventoryMovement.findMany({ where: { goodsReceiptId: { in: receiptIds } }, select: { id: true } });
        await prisma.goodsReceiptDetailChange.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
        await prisma.movementDetail.deleteMany({ where: { movementId: { in: movements.map(row => row.id) } } });
        await prisma.inventoryMovement.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
        await prisma.goodsReceiptDetail.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
        await prisma.goodsReceipt.deleteMany({ where: { id: { in: receiptIds } } });
        await prisma.supplierMaterial.deleteMany({ where: { supplierId: { in: [ids.supplier, ids.catalogSupplier].filter(Boolean) } } });
        await prisma.material.deleteMany({ where: { id: { in: [ids.material, ids.consumable, ...(ids.catalogIds ?? [])] } } });
        await prisma.supplier.deleteMany({ where: { id: { in: [ids.supplier, ids.catalogSupplier].filter(Boolean) } } });
        await prisma.person.delete({ where: { id: ids.person } });
        await prisma.presentation.delete({ where: { id: ids.presentation } });
        await prisma.unitMeasure.delete({ where: { id: ids.unit } });
        await prisma.user.delete({ where: { id: ids.user } });
    });

    it.each([['material', 'Material'], ['consumable', 'Consumable']])('lista y reporta solo compras homogéneas de %s', async (resource, label) => {
        const response = await request(app).get(path(resource)).query({ supplierId: ids.supplier }).expect(200);
        expect(response.body.data.map(receipt => receipt.id)).toEqual([receipts[resource].id]);
        expect(response.body.recordsFiltered).toBe(1);
        expect(response.body.data[0]).not.toHaveProperty('details');
        expect(response.body.data[0].observations).toBeNull();
        const detail = await request(app).get(`${path(resource)}/${receipts[resource].id}`).expect(200);
        expect(detail.body.goodsReceipt.details.map(row => row.materialId)).toEqual([ids[resource]]);
        expect(detail.body.goodsReceipt.observations).toBeNull();
        const other = resource === 'material' ? 'consumable' : 'material';
        await request(app).get(`${path(resource)}/${receipts[other].id}`).expect(404);
        await request(app).get(`${path(resource)}/${receipts.mixed.id}`).expect(404);
        const rows = await Array.fromAsync(services[resource][`find${label}GoodsReceiptReportRows`]({ supplierId: ids.supplier }));
        expect(rows.map(row => row.referenceNumber)).toEqual([receipts[resource].referenceNumber]);
    });

    it.each([['material', 'Material'], ['consumable', 'Consumable']])('el reporte de %s conserva el nombre histórico y los importes al renombrar el artículo', async (resource, label) => {
        const original = await prisma.material.findUniqueOrThrow({ where: { id: ids[resource] } });
        const name = `Nombre vigente ${resource} ${suffix}`;
        try {
            await prisma.material.update({ where: { id: ids[resource] }, data: { name } });
            const rows = await Array.fromAsync(services[resource][`find${label}GoodsReceiptReportRows`]({ supplierId: ids.supplier }));
            expect(rows[0]).toMatchObject({ materialName: original.name, netPurchaseAmount: 20, grossPurchaseAmount: 23.2 });
            const detail = await prisma.goodsReceiptDetail.findUniqueOrThrow({ where: { id: receipts[resource].details[0].id } });
            expect(detail.materialName).toBe(`RC ${resource} ${suffix}`);
        } finally {
            await prisma.material.update({ where: { id: ids[resource] }, data: { name: original.name } });
        }
    });

    it.each(['material', 'consumable'])('permite editar una compra homogénea de %s', async resource => {
        const receipt = receipts[resource];
        const beforeCounters = await prisma.referenceNumberCounter.findMany({
            where: { prefix: { in: ['CMA', 'CCO'] } }, orderBy: [{ prefix: 'asc' }, { year: 'asc' }]
        });
        await request(app).patch(`${path(resource)}/${receipt.id}`).send({
            supplierId: ids.supplier, receivedById: ids.person, receptionDate: '2026-10-07T00:00:00.000Z', observations: 'Contexto correcto', details: []
        }).expect(200);
        expect((await prisma.goodsReceipt.findUnique({ where: { id: receipt.id } })).observations).toBe('Contexto correcto');
        const detail = await request(app).get(`${path(resource)}/${receipt.id}`).expect(200);
        expect(detail.body.goodsReceipt.observations).toBe('Contexto correcto');
        expect(detail.body.goodsReceipt.referenceNumber).toBe(receipt.referenceNumber);
        const list = await request(app).get(path(resource)).query({ supplierId: ids.supplier }).expect(200);
        const row = list.body.data.find(item => item.id === receipt.id);
        expect(row.observations).toBe('Contexto correcto');
        expect(row).not.toHaveProperty('details');
        expect(await prisma.referenceNumberCounter.findMany({
            where: { prefix: { in: ['CMA', 'CCO'] } }, orderBy: [{ prefix: 'asc' }, { year: 'asc' }]
        })).toEqual(beforeCounters);
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

    const purchaseBody = resource => ({
        supplierId: ids.supplier, receivedById: ids.person, receptionDate: '2026-10-12T12:00:00.000Z',
        details: [{ materialId: ids[resource], quantity: 2, costPerUnitType: 10 }]
    });

    it('conserva una oferta con compra aunque llegue a cero y retira otra oferta del mismo artículo sin historial propio', async () => {
        ids.catalogSupplier ??= (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)) + 1, code: `CV${suffix}`,
            legalName: `RC other legal ${suffix}`, tradeName: `RC other supplier ${suffix}`
        } })).id;
        const materialId = ids.material;
        const offer = await prisma.supplierMaterial.findUniqueOrThrow({
            where: { supplierId_materialId: { materialId, supplierId: ids.supplier } }
        });
        try {
            await prisma.supplierMaterial.update({
                where: { id: offer.id }, data: { currentStock: 0, convertedQuantity: 0 }
            });
            await request(app).delete(`/catalog/material/${offer.id}`).expect(409)
                .expect(response => expect(response.body.code).toBe('MATERIAL_DELETE_HISTORY_CONFLICT'));
            const { body } = await request(app).get('/catalog/material')
                .query({ supplierId: ids.supplier, search: `RC material ${suffix}` }).expect(200);
            expect(body.data[0]).toMatchObject({ id: offer.id, canDelete: false });
            const unused = await prisma.supplierMaterial.create({ data: { materialId, supplierId: ids.catalogSupplier } });
            await request(app).delete(`/catalog/material/${unused.id}`).expect(200);
            expect(await prisma.supplierMaterial.findUnique({ where: { id: unused.id } })).toBeNull();
            expect(await prisma.material.findUnique({ where: { id: materialId } })).not.toBeNull();
        } finally {
            await prisma.supplierMaterial.update({
                where: { id: offer.id }, data: { currentStock: offer.currentStock, convertedQuantity: offer.convertedQuantity }
            });
        }
    });

    it('reclasifica un artículo sin proveedor y conserva las especificaciones de una compra anterior', async () => {
        const article = await prisma.material.create({ data: {
            name: `RC unlinked ${suffix}`, type: 'MATERIAL', base: 2, height: 3,
            presentationId: ids.presentation, unitMeasureId: ids.unit
        } });
        (ids.catalogIds ??= []).push(article.id);
        const line = await prisma.goodsReceiptDetail.create({ data: {
            materialId: article.id, materialName: article.name, goodsReceiptId: receipts.material.id,
            quantity: 1, convertedQuantity: 6, costPerUnitType: 10, conversionUnitCost: 2,
            netPurchaseAmount: 10, grossPurchaseAmount: 11.6
        } });
        try {
            const edited = await request(app).put(`/articles/materials/${article.id}`)
                .send({ name: article.name, type: 'CONSUMABLE', base: 4, height: 5, expectedVersion: article.version }).expect(200);
            expect(edited.body.data).toMatchObject({ type: 'CONSUMABLE', base: '4', height: '5' });
            await request(app).get(`${path('material')}/${receipts.material.id}`).expect(200).expect(response => {
                expect(response.body.goodsReceipt.details.find(item => item.id === line.id)).toMatchObject({
                    materialSpecification: { type: 'MATERIAL', base: '2', height: '3' },
                    convertedQuantity: '6'
                });
            });
            const rows = await Array.fromAsync(services.material.findMaterialGoodsReceiptReportRows({ supplierId: ids.supplier }));
            expect(rows.find(row => row.materialId === article.id)).toMatchObject({ materialBase: 2, materialHeight: 3 });
            const stored = await prisma.goodsReceiptDetail.findUniqueOrThrow({ where: { id: line.id } });
            expect(stored.updatedAt).toEqual(line.updatedAt);
        } finally {
            await prisma.goodsReceiptDetail.delete({ where: { id: line.id } });
        }
    });

    it.each(['material', 'consumable'])('compras de %s consultan identidades únicas y vinculan sólo las partidas confirmadas', async resource => {
        const type = resource === 'material' ? 'MATERIAL' : 'CONSUMABLE';
        ids.catalogIds ??= [];
        if (!ids.catalogSupplier) ids.catalogSupplier = (await prisma.supplier.create({ data: {
            codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `CAT${suffix}`,
            legalName: `Catalog legal ${suffix}`, tradeName: `Catalog supplier ${suffix}`
        } })).id;
        const catalog = [];
        for (const label of ['A', 'B', 'C', 'D']) {
            const item = await prisma.material.create({ data: { name: `RC-Catalog-${resource}-${suffix}-${label}`,
                type, presentationId: ids.presentation, unitMeasureId: ids.unit } });
            catalog.push(item);
            ids.catalogIds.push(item.id);
        }
        // B pertenece a dos proveedores: el catálogo debe mostrar una sola identidad.
        await prisma.supplierMaterial.createMany({ data: [ids.supplier, ids.catalogSupplier].map(supplierId => ({ supplierId, materialId: catalog[1].id })) });
        const result = await request(app).get(`/catalog/${resource}`).query({ catalog: true, supplierId: ids.supplier, search: `RC-Catalog-${resource}-${suffix}`, length: 20 }).expect(200);
        expect(result.body.recordsFiltered).toBe(4);
        expect(result.body.data.map(row => row.id)).toEqual(catalog.map(row => row.id));
        expect(result.body.data[0]).not.toHaveProperty('supplier');
        expect(result.body.data[0]).not.toHaveProperty('material');
        const next = await request(app).get(`/catalog/${resource}`).query({ catalog: true, search: `RC-Catalog-${resource}-${suffix}`, start: 1, length: 1 }).expect(200);
        expect(next.body.data.map(row => row.id)).toEqual([catalog[1].id]);
        const purchase = quantity => request(app).post(path(resource)).send({ ...purchaseBody(resource), details: [{ materialId: catalog[0].id, quantity, costPerUnitType: 10 }] });
        const created = await purchase(2).expect(200);
        const where = { supplierId_materialId: { supplierId: ids.supplier, materialId: catalog[0].id } };
        let offer = await prisma.supplierMaterial.findUniqueOrThrow({ where });
        expect(Number(offer.currentStock)).toBe(2);
        expect(offer.maxUnitCost === null ? null : Number(offer.maxUnitCost)).toBe(10);
        expect(await prisma.supplierMaterial.count({ where: { materialId: { in: [catalog[2].id, catalog[3].id] } } })).toBe(0);
        await purchase(0.5).expect(200);
        offer = await prisma.supplierMaterial.findUniqueOrThrow({ where });
        expect(Number(offer.currentStock)).toBe(2.5);
        expect(await prisma.supplierMaterial.count({ where: { supplierId: ids.supplier, materialId: catalog[0].id } })).toBe(1);
        await request(app).patch(`${path(resource)}/${created.body.goodsReceipt.id}`).send({ ...purchaseBody(resource), details: [{ materialId: catalog[2].id, quantity: 1, costPerUnitType: 10 }] }).expect(200);
        const addedOffer = await prisma.supplierMaterial.findUniqueOrThrow({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: catalog[2].id } } });
        expect(Number(addedOffer.currentStock)).toBe(1);
        expect(addedOffer.maxUnitCost === null ? null : Number(addedOffer.maxUnitCost)).toBe(10);
        await prisma.supplierMaterial.update({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: catalog[1].id } }, data: { isActive: false } });
        const before = await prisma.goodsReceipt.count({ where: { supplierId: ids.supplier } });
        await request(app).post(path(resource)).send({ ...purchaseBody(resource), details: [catalog[3], catalog[1]].map(row => ({ materialId: row.id, quantity: 1, costPerUnitType: 10 })) }).expect(409);
        expect(await prisma.goodsReceipt.count({ where: { supplierId: ids.supplier } })).toBe(before);
        expect(await prisma.supplierMaterial.count({ where: { materialId: catalog[3].id } })).toBe(0);
    });

    it('dos compras concurrentes vinculan artículos nuevos en orden inverso sin duplicar ofertas ni perder stock', async () => {
        const items = [];
        for (const name of ['A', 'B']) {
            const item = await prisma.material.create({ data: { name: `RC Concurrent ${name} ${suffix}`, type: 'MATERIAL', presentationId: ids.presentation, unitMeasureId: ids.unit } });
            items.push(item.id);
            (ids.catalogIds ??= []).push(item.id);
        }
        const create = ids => request(app).post(path('material')).send({ ...purchaseBody('material'), details: ids.map(materialId => ({ materialId, quantity: 1, costPerUnitType: 10 })) });
        const responses = await Promise.all([create(items), create([...items].reverse())]);
        expect(responses.map(response => response.status)).toEqual([200, 200]);
        const offers = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier, materialId: { in: items } } });
        expect(offers).toHaveLength(2);
        expect(offers.map(offer => Number(offer.currentStock))).toEqual([2, 2]);
        for (const response of responses) expect(await prisma.inventoryMovement.count({ where: { goodsReceiptId: response.body.goodsReceipt.id } })).toBe(1);
    });

    it.each(['KILOGRAMOS', 'METRO LINEAL'])('compra fracciones con presentación %s y costo total sin alterar la unidad', async name => {
        const where = { supplierId_materialId: { supplierId: ids.supplier, materialId: ids.consumable } };
        const original = await prisma.material.findUniqueOrThrow({ where: { id: ids.consumable }, select: { presentationId: true, base: true, height: true } });
        const presentation = await prisma.presentation.findUniqueOrThrow({ where: { name } });
        const originalOffer = await prisma.supplierMaterial.findUniqueOrThrow({ where, select: { maxUnitCost: true } });
        try {
            await prisma.material.update({ where: { id: ids.consumable }, data: { presentationId: presentation.id, base: 1, height: 1 } });
            await prisma.supplierMaterial.update({ where, data: { maxUnitCost: null } });
            const before = await prisma.supplierMaterial.findUniqueOrThrow({ where });
            const response = await request(app).post(path('consumable')).send({
                ...purchaseBody('consumable'),
                details: [{ materialId: ids.consumable, quantity: 0.75, costPerUnitType: 150, costIsTotal: false }]
            }).expect(200);
            const saved = await prisma.goodsReceiptDetail.findFirstOrThrow({ where: { goodsReceiptId: response.body.goodsReceipt.id } });
            expect(saved.costIsTotal).toBe(true);
            expect(Number(saved.quantity)).toBe(0.75);
            expect(Number(saved.convertedQuantity)).toBe(0.75);
            expect(Number(saved.conversionUnitCost)).toBe(200);
            expect(Number(saved.netPurchaseAmount)).toBe(150);
            expect(Number(saved.grossPurchaseAmount)).toBe(174);
            const after = await prisma.supplierMaterial.findUniqueOrThrow({ where });
            expect(Number(after.currentStock)).toBe(Number(before.currentStock) + 0.75);
            expect(Number(after.convertedQuantity)).toBe(Number(before.convertedQuantity) + 0.75);
            expect(Number(after.maxUnitCost)).toBe(200);
        } finally {
            await prisma.material.update({ where: { id: ids.consumable }, data: original });
            await prisma.supplierMaterial.update({ where, data: originalOffer });
        }
    });

    it.each(['material', 'consumable'])('comprar %s conserva el mayor costo unitario por oferta', async resource => {
        const where = { supplierId_materialId: { supplierId: ids.supplier, materialId: ids[resource] } };
        try {
            for (const maxUnitCost of [250, 10, 0, null]) {
                await prisma.supplierMaterial.update({ where, data: { maxUnitCost } });
                const response = await request(app).post(path(resource)).send({
                    ...purchaseBody(resource), maxUnitCost: 999,
                    details: [
                        { materialId: ids[resource], quantity: 2, costPerUnitType: 100, maxUnitCost: 999 },
                        { materialId: ids[resource], quantity: 1, costPerUnitType: 200 }
                    ]
                }).expect(200);
                const saved = await prisma.goodsReceiptDetail.findMany({ where: { goodsReceiptId: response.body.goodsReceipt.id } });
                expect(saved.map(detail => Number(detail.costPerUnitType)).sort((a, b) => a - b)).toEqual([100, 200]);
                const offer = await prisma.supplierMaterial.findUnique({ where });
                const expected = Math.max(maxUnitCost ?? 0, ...saved.map(detail => Number(detail.conversionUnitCost)));
                expect(offer.maxUnitCost === null ? null : Number(offer.maxUnitCost)).toBe(expected);
                const movementDetails = await prisma.movementDetail.findMany({
                    where: { movement: { goodsReceiptId: response.body.goodsReceipt.id } },
                    include: { cost: true }
                });
                expect(movementDetails).toHaveLength(saved.length);
                const costsByDetailId = new Map(saved.map(detail => [detail.id, detail.conversionUnitCost.toString()]));
                for (const line of movementDetails) {
                    expect(line.cost.unitCost.toString()).toBe(costsByDetailId.get(line.goodsReceiptDetailId));
                }
            }
        } finally {
            await prisma.supplierMaterial.update({ where, data: { maxUnitCost: 10 } });
        }
    });
    it('migra el máximo vigente de consumibles sin cambiar saldos ni costos de materiales', async () => {
        const migration = await readFile(new URL('../../../prisma/migrations/20261119200000_reconcile_consumable_max_unit_costs/migration.sql', import.meta.url), 'utf8');
        const rollback = new Error('Revertir datos de verificación de migración');
        await expect(prisma.$transaction(async tx => {
            const confirmed = await tx.status.findUniqueOrThrow({ where: { name: 'Confirmada' } });
            await tx.goodsReceipt.update({ where: { id: receipts.consumable.id }, data: { statusId: confirmed.id } });
            const line = {
                goodsReceiptId: receipts.consumable.id, materialId: ids.consumable,
                materialName: receipts.consumable.details[0].materialName,
                quantity: 1, convertedQuantity: 1, costPerUnitType: 600,
                netPurchaseAmount: 600, grossPurchaseAmount: 696
            };
            await tx.goodsReceiptDetail.createMany({ data: [
                { ...line, conversionUnitCost: 500 },
                { ...line, conversionUnitCost: 600 },
                { ...line, conversionUnitCost: 800, status: 'CANCELED' }
            ] });
            const read = materialId => tx.supplierMaterial.findUniqueOrThrow({
                where: { supplierId_materialId: { materialId, supplierId: ids.supplier } }
            });
            const before = await read(ids.consumable);
            const material = await read(ids.material);
            await tx.$executeRawUnsafe(migration);
            const after = await read(ids.consumable);
            expect(Number(after.maxUnitCost)).toBe(600);
            expect(after.currentStock).toEqual(before.currentStock);
            expect(await read(ids.material)).toEqual(material);
            await tx.supplierMaterial.update({ where: { id: after.id }, data: { maxUnitCost: 900 } });
            await tx.$executeRawUnsafe(migration);
            expect(Number((await read(ids.consumable)).maxUnitCost)).toBe(900);
            throw rollback;
        })).rejects.toBe(rollback);
    });

    const getCounter = prefix => prisma.referenceNumberCounter.findUnique({
        where: { prefix_year: { prefix, year: new Date().getFullYear() } }
    });

    it.each(['material', 'consumable'])('conserva el costo total en alta, lectura, corrección, reporte y cancelación de %s', async resource => {
        for (const name of ['Corrección de detalle de compra', 'Cancelación de detalle de compra'])
            await prisma.stockAdjustmentReason.upsert({ where: { name }, update: {}, create: { name } });
        const response = await request(app).post(path(resource)).send({ ...purchaseBody(resource),
            details: [{ materialId: ids[resource], quantity: 10, costPerUnitType: 500, costIsTotal: true }] }).expect(200);
        const receipt = response.body.goodsReceipt;
        const detail = await prisma.goodsReceiptDetail.findFirstOrThrow({ where: { goodsReceiptId: receipt.id } });
        expect(detail.costIsTotal).toBe(true);
        expect(Number(detail.conversionUnitCost)).toBe(50);
        expect(Number(detail.netPurchaseAmount)).toBe(500);
        expect(Number(detail.grossPurchaseAmount)).toBe(580);
        await request(app).get(`${path(resource)}/${receipt.id}`).expect(200).expect(result => {
            expect(result.body.goodsReceipt.details[0].costIsTotal).toBe(true);
        });
        await prisma.material.update({ where: { id: detail.materialId }, data: { name: `Nombre nuevo ${suffix}` } });
        try {
            await request(app).patch(`${path(resource)}/${receipt.id}/details/${detail.id}/corrections`)
                .send({ quantity: 5, costPerUnitType: 400 }).expect(200);
        } finally {
            await prisma.material.update({ where: { id: detail.materialId }, data: { name: detail.materialName } });
        }
        const corrected = await prisma.goodsReceiptDetail.findUniqueOrThrow({ where: { id: detail.id } });
        expect(corrected.costIsTotal).toBe(true);
        expect(corrected.materialName).toBe(detail.materialName);
        expect(Number(corrected.conversionUnitCost)).toBe(80);
        expect(Number(corrected.netPurchaseAmount)).toBe(400);
        const label = resource === 'material' ? 'Material' : 'Consumable';
        const rows = await Array.fromAsync(services[resource][`find${label}GoodsReceiptReportRows`]({ supplierId: ids.supplier }));
        expect(rows.find(row => row.referenceNumber === receipt.referenceNumber)).toMatchObject({ costIsTotal: true, netPurchaseAmount: 400 });
        await request(app).patch(`${path(resource)}/${receipt.id}/details/${detail.id}/cancel`).send({}).expect(200);
        const canceled = await prisma.goodsReceiptDetail.findUniqueOrThrow({ where: { id: detail.id } });
        expect(canceled.costIsTotal).toBe(true);
        expect(canceled.status).toBe('CANCELED');
        expect(Number(canceled.netPurchaseAmount)).toBe(400);
        const movements = await prisma.movementDetail.findMany({
            where: { goodsReceiptDetailId: detail.id },
            select: { cost: true, movement: { select: { goodsReceiptDetailChange: { select: { changeType: true } } } } }
        });
        expect(movements.map(line => [line.movement.goodsReceiptDetailChange?.changeType, line.cost.unitCost.toString()]))
            .toEqual(expect.arrayContaining([[undefined, '50'], ['QUANTITY_AND_COST', '50'], ['CANCELLATION', '80']]));
    });

    it('emite CMA y CCO concurrentes con contadores independientes e inventario del contexto correcto', async () => {
        const before = {
            material: (await getCounter('CMA'))?.counter ?? 0,
            consumable: (await getCounter('CCO'))?.counter ?? 0
        };
        const stocks = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier } });
        const resources = ['material', 'consumable', 'material', 'consumable', 'material', 'consumable'];
        const results = await Promise.all(resources.map(resource => request(app).post(path(resource))
            .send({ ...purchaseBody(resource), type: resource === 'material' ? 'CONSUMABLE' : 'MATERIAL' }).expect(200)));
        expect(new Set(results.map(result => result.body.goodsReceipt.referenceNumber)).size).toBe(6);
        for (const [resource, prefix, type] of [['material', 'CMA', 'MATERIAL'], ['consumable', 'CCO', 'CONSUMABLE']]) {
            const created = results.filter((_result, index) => resources[index] === resource).map(result => result.body.goodsReceipt);
            expect(created.map(receipt => Number(receipt.referenceNumber.split('-').at(-1))).sort((a, b) => a - b))
                .toEqual([before[resource] + 1, before[resource] + 2, before[resource] + 3]);
            for (const receipt of created) {
                expect(receipt.referenceNumber).toMatch(new RegExp(`^${prefix}-${new Date().getFullYear()}-\\d{6,}$`));
                const persisted = await prisma.goodsReceipt.findUnique({ where: { id: receipt.id }, include: { details: true } });
                expect(persisted.type).toBe(type);
                expect(persisted.details.map(detail => detail.materialId)).toEqual([ids[resource]]);
                expect(await prisma.inventoryMovement.count({ where: { goodsReceiptId: receipt.id } })).toBe(1);
            }
            expect((await getCounter(prefix)).counter).toBe(before[resource] + 3);
            const stock = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: ids[resource] } } });
            expect(Number(stock.currentStock)).toBe(Number(stocks.find(row => row.materialId === ids[resource]).currentStock) + 6);
        }
    });

    it.each([['material', 'CMA'], ['consumable', 'CCO']])('revierte contador, compra y stock si falla el registro de %s', async (resource, prefix) => {
        const beforeCounter = await getCounter(prefix);
        const beforeCount = await prisma.goodsReceipt.count({ where: { supplierId: ids.supplier } });
        const beforeStocks = await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { materialId: 'asc' } });
        const beforeMovements = await prisma.inventoryMovement.count({ where: { goodsReceipt: { supplierId: ids.supplier } } });
        await request(app).post(path(resource)).send({ ...purchaseBody(resource), observations: 'x'.repeat(501) }).expect(500);
        expect(await getCounter(prefix)).toEqual(beforeCounter);
        expect(await prisma.goodsReceipt.count({ where: { supplierId: ids.supplier } })).toBe(beforeCount);
        expect(await prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { materialId: 'asc' } })).toEqual(beforeStocks);
        expect(await prisma.inventoryMovement.count({ where: { goodsReceipt: { supplierId: ids.supplier } } })).toBe(beforeMovements);
    });

    it.each(['material', 'consumable'])('PIEZA en %s rechaza altas/correcciones fraccionarias sin cambiar stock ni historia', async resource => {
        await withPiecePresentation({ prisma, model: 'material', id: ids[resource] }, async () => {
            const snapshot = () => prisma.$transaction([
                prisma.supplierMaterial.findMany({ where: { supplierId: ids.supplier }, orderBy: { materialId: 'asc' } }),
                prisma.goodsReceipt.findUnique({ where: { id: receipts[resource].id }, include: { details: true } }),
                prisma.goodsReceipt.count({ where: { supplierId: ids.supplier } }),
                prisma.inventoryMovement.count({ where: { goodsReceipt: { supplierId: ids.supplier } } }),
                prisma.goodsReceiptDetailChange.count({ where: { goodsReceiptId: receipts[resource].id } })
            ]);
            const before = await snapshot();
            const invalid = await request(app).post(path(resource)).send({
                ...purchaseBody(resource), details: [{ materialId: ids[resource], quantity: 1.5, costPerUnitType: 1.25, presentation: { name: 'ROLLO' } }]
            }).expect(409);
            expect(invalid.body.code).toBe('INVENTORY_PIECE_QUANTITY_REQUIRED');
            const correction = await request(app).patch(`${path(resource)}/${receipts[resource].id}/details/${receipts[resource].details[0].id}/corrections`)
                .send({ quantity: 1.5, costPerUnitType: 10 }).expect(409);
            expect(correction.body.code).toBe('INVENTORY_PIECE_QUANTITY_REQUIRED');
            expect(await snapshot()).toEqual(before);

            const response = await request(app).post(path(resource)).send({
                ...purchaseBody(resource), details: [{ materialId: ids[resource], quantity: 2, costPerUnitType: 1.25 }]
            }).expect(200);
            const saved = await prisma.goodsReceipt.findUnique({ where: { id: response.body.goodsReceipt.id }, include: { details: true } });
            expect(Number(saved.details[0].quantity)).toBe(2);
            expect(Number(saved.details[0].costPerUnitType)).toBe(1.25);
            expect(Number(saved.totalNetPurchaseAmount)).toBe(2.5);
            expect(response.body.goodsReceipt.details[0].status).toBe('ACTIVE');
            expect(response.body.goodsReceipt.details[0]).not.toHaveProperty('isCancelled');
        });
    });

    it('exporta compras por mes a través del límite de lote y conserva fórmulas y resúmenes reales', async () => {
        const prefix = `RCB-${suffix}`;
        const rows = Array.from({ length: 252 }, (_, index) => ({
            id: randomUUID(), referenceNumber: `${prefix}-${String(index).padStart(3, '0')}`,
            supplierId: ids.supplier, supplierName: 'Proveedor de lotes', receivedById: ids.person,
            receivedByName: 'Receptor de lotes', receptionDate: new Date(index === 251 ? '2026-11-16T12:00:00Z' : '2026-10-16T12:00:00Z'),
            statusId: ids.status, type: 'MATERIAL', totalQuantity: 1,
            totalNetPurchaseAmount: 10, totalGrossPurchaseAmount: 11.6
        }));
        await prisma.goodsReceipt.createMany({ data: rows });
        await prisma.goodsReceiptDetail.createMany({ data: rows.map(row => ({
            goodsReceiptId: row.id, materialId: ids.material, materialName: 'Material por lotes',
            quantity: 1, convertedQuantity: 1, costPerUnitType: 10, conversionUnitCost: 10,
            netPurchaseAmount: 10, grossPurchaseAmount: 11.6
        })) });
        const response = await request(app).get('/purchase-report').query({ search: prefix })
            .buffer(true).parse((res, callback) => {
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => callback(null, Buffer.concat(chunks)));
            }).expect(200);
        const { workbook, sheet, rows: values } = await readExcelReport(response.body, '2026-10');
        expect(workbook.worksheets.map(item => item.name)).toEqual(['2026-10', '2026-11']);
        const november = workbook.getWorksheet('2026-11');
        expect(november.getCell('A2').value).toBe(`${prefix}-251`);
        expect(november.getCell('O2').value).toEqual({ formula: 'I2*N2', result: 10 });
        expect(november.getCell('B6').value).toBe(10);
        expect(values.filter(row => String(row[0]).startsWith(prefix))).toHaveLength(251);
        expect(new Set(values.filter(row => String(row[0]).startsWith(prefix)).map(row => row[0])).size).toBe(251);
        expect(sheet.getCell('O252').value).toEqual({ formula: 'I252*N252', result: 10 });
        expect(sheet.getCell('P252').value).toEqual({ formula: 'O252*1.16', result: 11.6 });
        expect(sheet.getCell('B257').value).toBe(2510);
        expect(sheet.getCell('D262').value).toBe(2510);
        expect(sheet.getCell('E262').value).toBe(251);
    });

});
