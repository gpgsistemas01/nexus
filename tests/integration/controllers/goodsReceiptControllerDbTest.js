import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const suffix = Math.random().toString(36).slice(2, 8);
const ids = {};
let app;
let prisma;

const cleanCreatedRecords = async () => {
  if (!prisma) return;
  const receipts = await prisma.goodsReceipt.findMany({
    where: { supplier: { code: `GR${suffix}` } },
    select: { id: true }
  });
  const receiptIds = receipts.map(({ id }) => id);
  const movements = await prisma.inventoryMovement.findMany({
    where: { goodsReceiptId: { in: receiptIds } },
    select: { id: true }
  });
  const movementIds = movements.map(({ id }) => id);

  await prisma.goodsReceiptDetailChange.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
  await prisma.movementDetail.deleteMany({ where: { movementId: { in: movementIds } } });
  await prisma.inventoryMovement.deleteMany({ where: { id: { in: movementIds } } });
  await prisma.goodsReceipt.deleteMany({ where: { id: { in: receiptIds } } });
  await prisma.supplierMaterial.deleteMany({ where: { id: ids.supplierMaterial } });
  await prisma.material.deleteMany({ where: { id: ids.material } });
  await prisma.supplier.deleteMany({ where: { id: ids.supplier } });
  await prisma.user.deleteMany({ where: { id: ids.user } });
  await prisma.person.deleteMany({ where: { id: ids.person } });
  await prisma.presentation.deleteMany({ where: { id: ids.presentation } });
  await prisma.unitMeasure.deleteMany({ where: { id: ids.unit } });
};

describe('goods receipt controller database integration', () => {
  beforeAll(async () => {
    const prismaModule = await import('../../../src/lib/prisma.js');
    const controller = await import('../../../src/controllers/api/warehouse/goodsReceiptController.js');
    prisma = prismaModule.prisma;
    app = createControllerTestApp({
      registerRoutes: router => {
        router.post('/goods-receipts', controller.registerGoodsReceipt);
        router.patch('/goods-receipts/:id/details/:detailId/corrections', (req, _res, next) => {
          req.user = { id: ids.user };
          next();
        }, controller.correctGoodsReceiptDetail);
      }
    });

    await prisma.status.upsert({ where: { name: 'Confirmada' }, update: {}, create: { name: 'Confirmada' } });
    await prisma.stockAdjustmentReason.upsert({
      where: { name: 'Corrección de detalle de compra' },
      update: {},
      create: { name: 'Corrección de detalle de compra' }
    });
    const unit = await prisma.unitMeasure.create({ data: { name: `IT GR Unit ${suffix}`, symbol: `g${suffix.slice(0, 4)}` } });
    const presentation = await prisma.presentation.create({ data: { name: `IT GR Presentation ${suffix}` } });
    const supplier = await prisma.supplier.create({
      data: {
        codeNumber: Number.parseInt(Date.now().toString().slice(-8)),
        code: `GR${suffix}`,
        legalName: `IT GR Supplier Legal ${suffix}`,
        tradeName: `IT GR Supplier ${suffix}`
      }
    });
    const material = await prisma.material.create({
      data: {
        name: `IT GR Material ${suffix}`,
        unitMeasureId: unit.id,
        presentationId: presentation.id,
        base: 1.23,
        height: 4.56
      }
    });
    const supplierMaterial = await prisma.supplierMaterial.create({
      data: { materialId: material.id, supplierId: supplier.id }
    });
    const person = await prisma.person.create({ data: { fullName: `IT GR Person ${suffix}` } });
    const user = await prisma.user.create({ data: { name: `ITGRUser${suffix}`, password: 'integration-only' } });
    Object.assign(ids, {
      unit: unit.id,
      presentation: presentation.id,
      supplier: supplier.id,
      material: material.id,
      supplierMaterial: supplierMaterial.id,
      person: person.id,
      user: user.id
    });
  });

  afterAll(cleanCreatedRecords);

  it('RF-REC-001/RF-REC-002 crea y corrige costos por controller con persistencia recalculada', async () => {
    const created = await request(app).post('/goods-receipts').send({
      supplierId: ids.supplier,
      receivedById: ids.person,
      isInvoiced: false,
      receptionDate: '2026-08-17T12:00:00.000Z',
      details: [{
        materialId: ids.material,
        quantity: 7.89,
        costPerUnitType: 12.345678,
        convertedQuantity: 1,
        conversionUnitCost: 1,
        netPurchaseAmount: 1,
        grossPurchaseAmount: 1
      }]
    }).expect(200);

    const receiptId = created.body.goodsReceipt.id;
    let receipt = await prisma.goodsReceipt.findUnique({
      where: { id: receiptId },
      include: { details: true }
    });
    const detailId = receipt.details[0].id;

    expect(receipt.details).toEqual([expect.objectContaining({ id: detailId })]);
    expect(Number(receipt.totalQuantity)).toBe(7.89);
    expect(Number(receipt.totalNetPurchaseAmount)).toBe(97.407399);
    expect(Number(receipt.totalGrossPurchaseAmount)).toBe(112.992583);
    expect(Number(receipt.details[0].convertedQuantity)).toBe(44.253432);
    expect(Number(receipt.details[0].conversionUnitCost)).toBe(2.201126);

    await request(app)
      .patch(`/goods-receipts/${receiptId}/details/${detailId}/corrections`)
      .send({
        quantity: 3.333333,
        costPerUnitType: 20.123456,
        conversionUnitCost: 999,
        netPurchaseAmount: 999,
        grossPurchaseAmount: 999
      })
      .expect(200);

    receipt = await prisma.goodsReceipt.findUnique({
      where: { id: receiptId },
      include: { details: true, detailChanges: true }
    });
    const supplierMaterial = await prisma.supplierMaterial.findUnique({ where: { id: ids.supplierMaterial } });
    const movements = await prisma.inventoryMovement.findMany({
      where: { goodsReceiptId: receiptId },
      orderBy: { createdAt: 'asc' }
    });

    expect(Number(receipt.totalQuantity)).toBe(3.333333);
    expect(Number(receipt.totalNetPurchaseAmount)).toBe(67.07818);
    expect(Number(receipt.totalGrossPurchaseAmount)).toBe(77.810689);
    expect(Number(receipt.details[0].convertedQuantity)).toBe(18.695998);
    expect(Number(receipt.details[0].conversionUnitCost)).toBe(3.587836);
    expect(Number(supplierMaterial.maxUnitCost)).toBe(3.587836);
    expect(Number(supplierMaterial.currentStock)).toBe(3.333333);
    expect(Number(supplierMaterial.convertedQuantity)).toBe(18.695998);
    expect(movements.map(({ type }) => type).sort()).toEqual(['ADJUSTMENT', 'ENTRY']);
    expect(receipt.detailChanges).toHaveLength(1);
    expect(Number(receipt.detailChanges[0].previousNetPurchaseAmount)).toBe(97.407399);
    expect(Number(receipt.detailChanges[0].correctedNetPurchaseAmount)).toBe(67.07818);
  });
});
