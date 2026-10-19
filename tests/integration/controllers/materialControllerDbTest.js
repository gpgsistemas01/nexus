import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { consumableValidation, materialValidation } from '../../../src/validators/forms/materialValidations.js';
import { validate } from '../../../src/middleware/validatorMiddleware.js';

const suffix = randomUUID().slice(0, 8);
const ids = {};
let prisma;
let app;
const body = name => ({
  name: `IT Measures ${name} ${suffix}`, supplierId: ids.supplier, presentationId: ids.presentation,
  unitMeasureId: ids.piece, isActive: true, maxUnitCost: 10, newStock: 7
});

describe('registro de materiales con y sin medidas', () => {
  beforeAll(async () => {
    prisma = (await import('../../../src/lib/prisma.js')).prisma;
    const { registerMaterial } = await import('../../../src/controllers/api/warehouse/materialController.js');
    const { registerConsumable } = await import('../../../src/controllers/api/warehouse/consumableController.js');
    const { getWasteMaterialTemplates, registerWaste } = await import('../../../src/controllers/api/warehouse/wasteController.js');
    const { wasteValidation } = await import('../../../src/validators/forms/wasteValidations.js');
    app = createControllerTestApp({ registerRoutes: router => {
      router.use((req, _res, next) => { req.user = { id: ids.user, permissions: [] }; next(); });
      router.post('/materials', materialValidation, validate, registerMaterial);
      router.post('/consumables', consumableValidation, validate, registerConsumable);
      router.get('/wastes/material-templates', getWasteMaterialTemplates);
      router.post('/wastes', wasteValidation, validate, registerWaste);
    } });
    ids.user = (await prisma.user.create({ data: { name: `IT Measures ${suffix}`, password: 'integration-only' } })).id;
    ids.presentation = (await prisma.presentation.create({ data: { name: `IT Measures ${suffix}` } })).id;
    ids.supplier = (await prisma.supplier.create({ data: {
      codeNumber: Date.now() % 100000000, code: suffix, legalName: `IT Measures ${suffix}`, tradeName: `IT Measures ${suffix}`
    } })).id;
    for (const [unit, name, symbol] of [['piece', 'PIEZA', 'p'], ['meters', 'METRO CUADRADO', 'm'], ['liters', 'LITRO', 'l']]) {
      ids[unit] = (await prisma.unitMeasure.create({ data: { name, symbol: `${symbol}${suffix}` } })).id;
    }
    ids.sources = {};
    for (const [kind, unit, type] of [['square', 'meters', 'MATERIAL'], ['piece', 'piece', 'MATERIAL'], ['liters', 'liters', 'MATERIAL'], ['consumable', 'meters', 'CONSUMABLE']]) {
      const source = await prisma.material.create({ data: { name: `IT Source ${kind} ${suffix}`, presentationId: ids.presentation, unitMeasureId: ids[unit], type, base: type === 'MATERIAL' ? 2 : null, height: type === 'MATERIAL' ? 3 : null } });
      ids.sources[kind] = source.id;
      await prisma.supplierMaterial.create({ data: { materialId: source.id, supplierId: ids.supplier, maxUnitCost: 10 } });
    }
    await prisma.stockAdjustmentReason.upsert({ where: { name: 'Stock inicial' }, update: {}, create: { name: 'Stock inicial' } });
  });

  afterAll(async () => {
    if (!prisma) return;
    if (ids.user) {
      const adjustments = await prisma.stockAdjustment.findMany({ where: { createdById: ids.user }, select: { id: true } });
      const adjustmentIds = adjustments.map(row => row.id);
      await prisma.movementDetail.deleteMany({ where: { stockAdjustmentDetail: { stockAdjustmentId: { in: adjustmentIds } } } });
      await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: adjustmentIds } } });
      await prisma.stockAdjustmentDetail.deleteMany({ where: { stockAdjustmentId: { in: adjustmentIds } } });
      await prisma.stockAdjustment.deleteMany({ where: { id: { in: adjustmentIds } } });
    }
    if (ids.supplier) await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
    if (ids.presentation) await prisma.material.deleteMany({ where: { presentationId: ids.presentation } });
    if (ids.supplier) await prisma.supplier.delete({ where: { id: ids.supplier } });
    if (ids.presentation) await prisma.presentation.delete({ where: { id: ids.presentation } });
    await prisma.unitMeasure.deleteMany({ where: { id: { in: [ids.piece, ids.meters, ids.liters].filter(Boolean) } } });
    if (ids.user) await prisma.user.delete({ where: { id: ids.user } });
  });

  it.each(['direct', 'goodsReceipt'])('registra piezas sin medidas desde %s y conserva su cantidad', async context => {
    const data = { ...body(context), ...(context === 'goodsReceipt' ? { creationContext: context } : {}) };
    await request(app).post('/materials').send(data).expect(200);
    const saved = await prisma.supplierMaterial.findFirst({
      where: { supplierId: ids.supplier, material: { name: data.name } }, include: { material: true }
    });

    expect(saved.material).toMatchObject({ base: null, height: null, unitMeasureId: ids.piece });
    expect(Number(saved.currentStock)).toBe(context === 'direct' ? 7 : 0);
    expect(Number(saved.convertedQuantity)).toBe(context === 'direct' ? 7 : 0);
    if (context === 'goodsReceipt') expect(saved.maxUnitCost).toBeNull();
    expect(await prisma.stockAdjustmentDetail.count({ where: { materialId: saved.materialId } }))
      .toBe(context === 'direct' ? 1 : 0);
  });

  it.each(['meters', 'liters'])('conserva las medidas y la conversión para %s', async unit => {
    const data = { ...body(unit), unitMeasureId: ids[unit], base: 2, height: 3 };
    await request(app).post('/materials').send(data).expect(200);
    const saved = await prisma.supplierMaterial.findFirst({
      where: { supplierId: ids.supplier, material: { name: data.name } }, include: { material: true }
    });

    expect(Number(saved.material.base)).toBe(2);
    expect(Number(saved.material.height)).toBe(3);
    expect(Number(saved.currentStock)).toBe(7);
    expect(Number(saved.convertedQuantity)).toBe(42);
  });

  it.each(['base', 'height'])('rechaza una pareja incompleta con código por campo, sin crear material ni oferta: %s', async field => {
    const data = { ...body(`incomplete ${field}`), unitMeasureId: ids.meters, [field]: 2 };
    const missing = field === 'base' ? 'height' : 'base';
    const response = await request(app).post('/materials').send(data).expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { [missing]: { code: `${missing.toUpperCase()}_REQUIRED` } } });
    expect(await prisma.material.count({ where: { presentationId: ids.presentation, name: data.name } })).toBe(0);
    expect(await prisma.supplierMaterial.count({ where: { supplierId: ids.supplier, material: { name: data.name } } })).toBe(0);
  });

  it.each(['direct', 'goodsReceipt'])('registra consumibles sin medidas desde %s, incluso si llegan campos sobrantes', async context => {
    const data = { ...body(`consumable ${context}`), unitMeasureId: ids.meters, base: 2, height: 'ignorado', ...(context === 'goodsReceipt' ? { creationContext: context } : {}) };
    await request(app).post('/consumables').send(data).expect(200);
    const saved = await prisma.supplierMaterial.findFirst({ where: { supplierId: ids.supplier, material: { name: data.name } }, include: { material: true } });
    expect(saved.material).toMatchObject({ type: 'CONSUMABLE', base: null, height: null });
    expect(Number(saved.convertedQuantity)).toBe(context === 'direct' ? 7 : 0);
  });

  it('ofrece para merma sólo materiales en m² del proveedor y excluye consumibles', async () => {
    const response = await request(app).get('/wastes/material-templates').query({ supplierId: ids.supplier }).expect(200);
    const eligible = await prisma.material.findMany({ where: { presentationId: ids.presentation, type: 'MATERIAL', unitMeasureId: ids.meters } });
    expect(response.body.data.map(item => item.id).sort()).toEqual(eligible.map(item => item.id).sort());
    expect(response.body.data.some(item => item.id === ids.sources.square)).toBe(true);
    expect(response.body.data.some(item => item.id === ids.sources.consumable)).toBe(false);
  });

  it.each(['piece', 'liters', 'consumable'])('rechaza un origen de merma no admitido aunque se fuerce el id: %s', async kind => {
    const before = await prisma.waste.count({ where: { supplierId: ids.supplier } });
    const response = await request(app).post('/wastes').send({ operationId: randomUUID(), name: `IT Rejected ${kind} ${suffix}`, materialId: ids.sources[kind], supplierId: ids.supplier, base: 1, height: 2, maxUnitCost: 10, initialQuantity: 1, isActive: true }).expect(400);
    expect(response.body.code).toBe('WASTE_MATERIAL_INVALID');
    expect(await prisma.waste.count({ where: { supplierId: ids.supplier } })).toBe(before);
  });

});
