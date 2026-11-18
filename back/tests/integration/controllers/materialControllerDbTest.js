import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { withPiecePresentation } from '../../helpers/withPiecePresentation.js';
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
    for (const [unit, name, symbol] of [['piece', 'PIEZA', 'p'], ['meters', 'METRO CUADRADO', 'm'], ['liters', 'LITRO', 'l'], ['kilograms', 'KILOGRAMO', 'k'], ['linear', 'METRO LINEAL', 'ml']]) {
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
    if (ids.presentation) await prisma.material.deleteMany({ where: { OR: [{ presentationId: ids.presentation }, { name: { startsWith: 'IT Measures ', endsWith: suffix } }] } });
    if (ids.supplier) await prisma.supplier.delete({ where: { id: ids.supplier } });
    if (ids.presentation) await prisma.presentation.delete({ where: { id: ids.presentation } });
    await prisma.unitMeasure.deleteMany({ where: { id: { in: [ids.piece, ids.meters, ids.liters, ids.kilograms, ids.linear].filter(Boolean) } } });
    if (ids.user) await prisma.user.delete({ where: { id: ids.user } });
  });

  it.each([['materials', 'MATERIAL'], ['consumables', 'CONSUMABLE']])('vincula %s por ID sin duplicar ni alterar el catálogo y conserva decimales', async (resource, type) => {
    const presentation = await prisma.presentation.upsert({ where: { name: 'KILOGRAMOS' }, update: {}, create: { name: 'KILOGRAMOS' } });
    const identity = await prisma.material.create({ data: { name: `IT Measures selected ${resource} ${suffix}`, type, presentationId: presentation.id, unitMeasureId: ids.kilograms, base: 1, height: 1, minStock: 0 } });
    const countBefore = await prisma.material.count();
    const data = { materialId: identity.id, supplierId: ids.supplier, maxUnitCost: 10, isActive: true, newStock: 7.25,
      name: 'Identidad manipulada', base: 999, height: 999, presentationId: randomUUID(), minStock: 999 };
    await prisma.presentation.update({ where: { id: presentation.id }, data: { isActive: false } });
    try {
      const rejected = await request(app).post(`/${resource}`).send(data).expect(404);
      expect(rejected.body.code).toBe('PRESENTATION_NOT_FOUND');
      expect(await prisma.supplierMaterial.count({ where: { materialId: identity.id } })).toBe(0);
    } finally {
      await prisma.presentation.update({ where: { id: presentation.id }, data: { isActive: true } });
    }
    await request(app).post(`/${resource}`).send(data).expect(200);
    expect(await prisma.material.count()).toBe(countBefore);
    const saved = await prisma.supplierMaterial.findUniqueOrThrow({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: identity.id } }, include: { material: true } });
    expect(saved.material.name).toBe(identity.name);
    expect(Number(saved.material.base)).toBe(1);
    expect(Number(saved.material.minStock)).toBe(0);
    expect(Number(saved.currentStock)).toBe(7.25);
    expect(Number(saved.convertedQuantity)).toBe(7.25);
    await request(app).post(`/${resource}`).send(data).expect(409);
    expect(Number((await prisma.supplierMaterial.findUniqueOrThrow({ where: { id: saved.id } })).currentStock)).toBe(7.25);
    const wrongResource = resource === 'materials' ? 'consumables' : 'materials';
    await request(app).post(`/${wrongResource}`).send(data).expect(404);
  });

  it('rechaza stock fraccionario para una identidad PIEZA sin dejar relación ni movimientos', async () => {
    await withPiecePresentation({ prisma }, async presentationId => {
      const identity = await prisma.material.create({ data: { name: `IT Measures piece selected ${suffix}`, type: 'CONSUMABLE', presentationId, unitMeasureId: ids.piece } });
      await request(app).post('/consumables').send({ materialId: identity.id, supplierId: ids.supplier, maxUnitCost: 0, isActive: true, newStock: 1.5 }).expect(409);
      expect(await prisma.supplierMaterial.count({ where: { materialId: identity.id } })).toBe(0);
      expect(await prisma.stockAdjustmentDetail.count({ where: { materialId: identity.id } })).toBe(0);
      await prisma.material.delete({ where: { id: identity.id } });
    });
  });

  it.each(['direct', 'goodsReceipt'])('registra piezas sin medidas desde %s y conserva su cantidad', async context => {
    const data = { ...body(context), ...(context === 'goodsReceipt' ? { creationContext: context } : {}) };
    await request(app).post('/materials').send(data).expect(200);
    const material = await prisma.material.findFirstOrThrow({ where: { name: data.name } });
    expect(material).toMatchObject({ base: null, height: null, unitMeasureId: ids.piece });
    const saved = await prisma.supplierMaterial.findFirst({ where: { materialId: material.id, supplierId: ids.supplier } });
    if (context === 'goodsReceipt') expect(saved).toBeNull();
    else {
      expect(Number(saved.currentStock)).toBe(7);
      expect(Number(saved.convertedQuantity)).toBe(7);
    }
    expect(await prisma.stockAdjustmentDetail.count({ where: { materialId: material.id } })).toBe(context === 'direct' ? 1 : 0);
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

  it.each(['materials', 'consumables'])('PIEZA en %s rechaza stock inicial y mínimo fraccionarios sin crear artículo ni ajuste', async resource => {
    await withPiecePresentation({ prisma }, async presentationId => {
      const snapshot = () => prisma.$transaction([
        prisma.material.count({ where: { supplierMaterials: { some: { supplierId: ids.supplier } } } }),
        prisma.supplierMaterial.count({ where: { supplierId: ids.supplier } }),
        prisma.stockAdjustment.count(), prisma.inventoryMovement.count()
      ]);
      const before = await snapshot();
      for (const [field, value] of [['newStock', 1.5], ['minStock', 0.5]]) {
        const response = await request(app).post(`/${resource}`).send({ ...body(`piece-${field}`), presentationId, [field]: value }).expect(409);
        expect(response.body.code).toBe('INVENTORY_PIECE_QUANTITY_REQUIRED');
        expect(await snapshot()).toEqual(before);
      }
    });
  });

  it('convierte la captura y persiste stock cero, dos decimales de mínimo y seis de costo', async () => {
    const data = { ...body('typed-decimals'), minStock: '999999999999.99', newStock: '0',
      maxUnitCost: '12.123456', isActive: 'true' };
    await request(app).post('/materials').send(data).expect(200);
    const saved = await prisma.supplierMaterial.findFirst({
      where: { supplierId: ids.supplier, material: { name: data.name } }, include: { material: true }
    });

    expect(saved.currentStock.toString()).toBe('0');
    expect(saved.material.minStock.toString()).toBe('999999999999.99');
    expect(saved.maxUnitCost.toString()).toBe('12.123456');
    expect(saved.isActive).toBe(true);
  });

  it.each(['base', 'height'])('rechaza una pareja incompleta con código por campo, sin crear material ni oferta: %s', async field => {
    const data = { ...body(`incomplete ${field}`), unitMeasureId: ids.meters, [field]: 2 };
    const missing = field === 'base' ? 'height' : 'base';
    const response = await request(app).post('/materials').send(data).expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { [missing]: { code: `${missing.toUpperCase()}_REQUIRED` } } });
    expect(await prisma.material.count({ where: { presentationId: ids.presentation, name: data.name } })).toBe(0);
    expect(await prisma.supplierMaterial.count({ where: { supplierId: ids.supplier, material: { name: data.name } } })).toBe(0);
  });

  it.each(['direct', 'goodsReceipt'])('rechaza medidas inválidas de consumibles desde %s sin persistir cambios', async context => {
    const data = { ...body(`consumable ${context}`), unitMeasureId: ids.meters, base: 2, height: 'ignorado', ...(context === 'goodsReceipt' ? { creationContext: context } : {}) };
    await request(app).post('/consumables').send(data).expect(400);
    expect(await prisma.material.count({ where: { name: data.name } })).toBe(0);
    expect(await prisma.supplierMaterial.count({ where: { supplierId: ids.supplier, material: { name: data.name } } })).toBe(0);
  });

  it.each(['kilograms', 'linear'].flatMap(unit => ['direct', 'goodsReceipt'].map(context => ({ unit, context }))))('consumible $unit desde $context persiste unidad 1 × 1 y deriva las medidas de la presentación y rechaza factores arbitrarios', async ({ unit, context }) => {
    const presentationName = unit === 'kilograms' ? 'KILOGRAMOS' : 'METRO LINEAL';
    const presentation = await prisma.presentation.upsert({ where: { name: presentationName }, update: {}, create: { name: presentationName } });
    const data = { ...body(`unit-${unit}-${context}`), unitMeasureId: ids[unit], presentationId: presentation.id,
      base: 1, height: 1, newStock: 7.5, ...(context === 'goodsReceipt' ? { creationContext: context } : {}) };
    for (const invalid of [{ height: 2 }]) {
      await request(app).post('/consumables').send({ ...data, ...invalid }).expect(400);
      expect(await prisma.material.count({ where: { name: data.name } })).toBe(0);
    }
    await request(app).post('/consumables').send({ ...data, base: null, height: null }).expect(200);
    const material = await prisma.material.findFirstOrThrow({ where: { name: data.name } });
    expect(Number(material.base)).toBe(1);
    expect(Number(material.height)).toBe(1);
    expect(material.presentationId).toBe(presentation.id);
    const saved = await prisma.supplierMaterial.findFirst({ where: { materialId: material.id, supplierId: ids.supplier } });
    if (context === 'goodsReceipt') expect(saved).toBeNull();
    else {
      expect(Number(saved.currentStock)).toBe(7.5);
      expect(Number(saved.convertedQuantity)).toBe(7.5);
    }
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

  it('conserva búsqueda parcial por nombre, tipo, proveedor y visibilidad de costos con el índice de trigramas', async () => {
    const { findAllSupplierMaterials } = await import('../../../src/services/warehouse/materials/supplierMaterialService.js');
    const name = `Lamina Ámbar ${suffix}`;
    const expected = new Map();
    for (const type of ['MATERIAL', 'CONSUMABLE']) {
      const material = await prisma.material.create({ data: {
        name, type, presentationId: ids.presentation, unitMeasureId: ids.meters,
        ...(type === 'MATERIAL' && { base: 2, height: 3 })
      } });
      await prisma.supplierMaterial.create({ data: { materialId: material.id, supplierId: ids.supplier, maxUnitCost: 10 } });
      expected.set(type, material.id);
    }
    for (const type of ['MATERIAL', 'CONSUMABLE']) {
      const page = await findAllSupplierMaterials({ type, supplierId: ids.supplier,
        search: `mInA ÁmBaR ${suffix}`, orderBy: 'name', canReadCosts: false });
      expect(page.recordsFiltered).toBe(1);
      expect(page.data.map(row => row.material.id)).toEqual([expected.get(type)]);
      expect(page.data[0].material.name).toBe(name);
      expect(page.data[0]).not.toHaveProperty('maxUnitCost');
    }
    const absent = await findAllSupplierMaterials({ type: 'MATERIAL', supplierId: randomUUID(), search: name });
    expect(absent.recordsFiltered).toBe(0);
    expect(absent.data).toEqual([]);
  });

});
