import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { runContendedOperations } from '../../helpers/concurrentDatabaseOperations.js';
import { wasteValidation, wasteStockAdditionValidation, wasteStockAdjustmentValidation } from '../../../src/validators/forms/wasteValidations.js';
import { materialValidation, materialEditValidation, materialStockValidation, consumableValidation } from '../../../src/validators/forms/materialValidations.js';
import { validate } from '../../../src/middleware/validatorMiddleware.js';
import { lockWasteStock } from '../../../src/repository/warehouse/stockLockRepository.js';

let prisma;
let app;
const ids = {};
const suffix = randomUUID().slice(0, 8);
const materialIds = [];
const wasteBody = (extra = {}) => ({
  operationId: randomUUID(), name: `IT Write Waste ${randomUUID()}`, materialId: ids.material,
  supplierId: ids.supplier, base: 1.5, height: 2, maxUnitCost: 10,
  initialQuantity: 3, minStock: 0, isActive: true, ...extra
});
const entry = (id, body) => request(app).post(`/wastes/${id}/stock-additions`).send(body);
const getStock = id => prisma.waste.findUniqueOrThrow({ where: { id } });

beforeAll(async () => {
  ({ prisma } = await import('../../../src/lib/prisma.js'));
  const waste = await import('../../../src/controllers/api/warehouse/wasteController.js');
  const materials = await import('../../../src/controllers/api/warehouse/materialController.js');
  const consumables = await import('../../../src/controllers/api/warehouse/consumableController.js');
  const user = await import('../../../src/controllers/api/admin/userController.js');
  const { userEditValidation } = await import('../../../src/validators/forms/userValidations.js');
  const client = await import('../../../src/controllers/api/sales/clientController.js');
  const { clientEditValidation } = await import('../../../src/validators/forms/clientValidations.js');
  app = createControllerTestApp({ registerRoutes: router => {
    router.use((req, _res, next) => { req.user = { id: ids.user, permissions: [] }; next(); });
    router.get('/templates', waste.getWasteMaterialTemplates);
    router.post('/wastes', wasteValidation, validate, waste.registerWaste);
    router.post('/wastes/:id/stock-additions', wasteStockAdditionValidation, validate, waste.registerWasteStockAddition);
    router.patch('/wastes/:id/stock', wasteStockAdjustmentValidation, validate, waste.editWasteStock);
    router.patch('/users/:id', userEditValidation, validate, user.editUser);
    router.patch('/materials/:id', materialEditValidation, validate, materials.editMaterial);
    router.patch('/materials/:id/stock', materialStockValidation, validate, materials.editMaterialStock);
    router.patch('/consumables/:id', materialEditValidation, validate, consumables.editConsumable);
    router.post('/materials', materialValidation, validate, materials.registerMaterial);
    router.post('/consumables', consumableValidation, validate, consumables.registerConsumable);
    router.put('/clients/:id', clientEditValidation, validate, client.editClient);
  } });
  ids.user = (await prisma.user.create({ data: { name: `IT Write User ${suffix}`, password: 'integration-only' } })).id;
  ids.unit = (await prisma.unitMeasure.create({ data: { name: 'METRO CUADRADO', symbol: suffix } })).id;
  ids.presentation = (await prisma.presentation.create({ data: { name: `IT Write Sheet ${suffix}` } })).id;
  ids.supplier = (await prisma.supplier.create({ data: { codeNumber: 100, code: `CW${suffix}`, legalName: suffix, tradeName: suffix } })).id;
  ids.reason = (await prisma.stockAdjustmentReason.upsert({ where: { name: 'Stock inicial' }, update: {}, create: { name: 'Stock inicial' } })).id;
  ids.role = (await prisma.role.create({ data: { name: `IT Write Role ${suffix}` } })).id;
  ids.department = (await prisma.department.create({ data: { name: `IT Write Dept ${suffix}` } })).id;
  ids.client = (await prisma.client.create({ data: { name: `IT Write Client ${suffix}` } })).id;
  ids.material = (await prisma.material.create({ data: {
    name: `IT Write Material ${suffix}`, presentationId: ids.presentation, unitMeasureId: ids.unit, base: 1.5, height: 20,
    supplierMaterials: { create: { supplierId: ids.supplier, maxUnitCost: 10 } }
  } })).id;
  materialIds.push(ids.material);
});

afterAll(async () => {
  if (!prisma || !ids.user) return;
  await prisma.wasteOperation.deleteMany({ where: { userId: ids.user } });
  const wastes = await prisma.waste.findMany({ where: { supplierId: ids.supplier }, select: { id: true } });
  const wasteIds = wastes.map(row => row.id);
  const wasteMovements = await prisma.wasteMovement.findMany({ where: { details: { some: { wasteId: { in: wasteIds } } } }, select: { id: true } });
  await prisma.wasteStockEntry.deleteMany({ where: { wasteId: { in: wasteIds } } });
  await prisma.wasteMovementDetail.deleteMany({ where: { wasteId: { in: wasteIds } } });
  await prisma.wasteStockAdjustmentDetail.deleteMany({ where: { wasteId: { in: wasteIds } } });
  await prisma.wasteMovement.deleteMany({ where: { id: { in: wasteMovements.map(row => row.id) } } });
  await prisma.wasteStockAdjustment.deleteMany({ where: { createdById: ids.user } });
  await prisma.waste.deleteMany({ where: { id: { in: wasteIds } } });
  const adjustments = await prisma.stockAdjustment.findMany({ where: { createdById: ids.user }, select: { id: true } });
  const adjustmentIds = adjustments.map(row => row.id);
  await prisma.movementDetail.deleteMany({ where: { materialId: { in: materialIds } } });
  await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: adjustmentIds } } });
  await prisma.stockAdjustmentDetail.deleteMany({ where: { stockAdjustmentId: { in: adjustmentIds } } });
  await prisma.stockAdjustment.deleteMany({ where: { id: { in: adjustmentIds } } });
  await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
  await prisma.material.deleteMany({ where: { id: { in: materialIds } } });
  await prisma.supplier.delete({ where: { id: ids.supplier } });
  if (ids.rollPresentation) await prisma.presentation.delete({ where: { id: ids.rollPresentation } });
  await prisma.presentation.delete({ where: { id: ids.presentation } });
  await prisma.unitMeasure.delete({ where: { id: ids.unit } });
  await prisma.client.delete({ where: { id: ids.client } });
  await prisma.userRoleDepartment.deleteMany({ where: { userId: ids.user } });
  await prisma.user.delete({ where: { id: ids.user } });
  await prisma.role.delete({ where: { id: ids.role } });
  await prisma.department.delete({ where: { id: ids.department } });
});

describe('recibos de operaciones de merma (DP-CON-001)', () => {
  it.each([0, 3])('recupera el alta de cantidad %i después de perder su respuesta', async initialQuantity => {
    const body = wasteBody({ initialQuantity });
    const first = await request(app).post('/wastes').send(body).expect(200);
    const retry = await request(app).post('/wastes').send(body).expect(200);
    expect(retry.body).toEqual(first.body);
    const saved = await getStock(first.body.waste.id);
    expect(Number(saved.currentStock)).toBe(initialQuantity);
    expect(await prisma.wasteStockEntry.count({ where: { wasteId: saved.id } })).toBe(initialQuantity ? 1 : 0);
    expect(await prisma.wasteOperation.count({ where: { userId: ids.user, operationId: body.operationId } })).toBe(1);
  });

  it('una entrada simultánea y su reintento suman una sola vez; otra clave representa una entrada nueva', async () => {
    const created = await request(app).post('/wastes').send(wasteBody()).expect(200);
    const id = created.body.waste.id;
    const body = { operationId: randomUUID(), quantity: 2, observations: 'Entrada recuperable' };
    const results = await runContendedOperations({
      prisma, table: ['Waste', 'WasteOperation'], lock: tx => lockWasteStock({ tx, id }),
      actions: [() => entry(id, body), () => entry(id, body)]
    });
    expect(results.map(result => result.status)).toEqual([200, 200]);
    expect(results[0].body).toEqual(results[1].body);
    expect(Number((await getStock(id)).currentStock)).toBe(5);
    expect(await prisma.wasteStockEntry.count({ where: { wasteId: id } })).toBe(2);
    await entry(id, { ...body, quantity: 4 }).expect(409).expect(result => expect(result.body.code).toBe('OPERATION_KEY_CONFLICT'));
    expect(Number((await getStock(id)).currentStock)).toBe(5);
    await entry(id, { ...body, operationId: randomUUID() }).expect(200);
    expect(Number((await getStock(id)).currentStock)).toBe(7);
  });

  it('el rechazo revierte el recibo y permite corregir la captura con esa clave', async () => {
    const id = randomUUID();
    const operationId = randomUUID();
    await entry(id, { operationId, quantity: 2 }).expect(404).expect(result => expect(result.body.meta.operationRejected).toBe(true));
    expect(await prisma.wasteOperation.count({ where: { userId: ids.user, operationId } })).toBe(0);
    const created = await request(app).post('/wastes').send(wasteBody()).expect(200);
    await entry(created.body.waste.id, { operationId, quantity: 2 }).expect(200);
    expect(Number((await getStock(created.body.waste.id)).currentStock)).toBe(5);
  });

  it('rechaza la escritura sin clave antes de generar documentos', async () => {
    const body = wasteBody();
    delete body.operationId;
    await request(app).post('/wastes').send(body).expect(400);
    expect(await prisma.waste.count({ where: { name: body.name } })).toBe(0);
  });
});

describe('ofertas y formularios desactualizados (DP-CON-002)', () => {
  it.each(['MATERIAL', 'CONSUMABLE'])('el alta concurrente de %s sólo registra un ajuste inicial', async type => {
    const material = await prisma.material.create({ data: {
      name: `IT Write Offer ${randomUUID()}`, type, presentationId: ids.presentation, unitMeasureId: ids.unit,
      ...(type === 'MATERIAL' && { base: 1.5, height: 20 })
    } });
    materialIds.push(material.id);
    const body = { name: material.name, supplierId: ids.supplier, presentationId: ids.presentation, unitMeasureId: ids.unit,
      ...(type === 'MATERIAL' && { base: 1.5, height: 20 }), maxUnitCost: 10, isActive: true, minStock: 0 };
    const url = type === 'MATERIAL' ? '/materials' : '/consumables';
    const results = await runContendedOperations({
      prisma, table: 'SupplierMaterial',
      lock: tx => tx.$queryRaw`SELECT "id" FROM "Supplier" WHERE "id" = ${ids.supplier}::uuid FOR UPDATE`,
      actions: [5, 9].map(newStock => () => request(app).post(url).send({ ...body, newStock }))
    });
    expect(results.map(result => result.status).sort()).toEqual([200, 409]);
    expect(results.find(result => result.status === 409).body.code).toBe('MATERIAL_ALREADY_EXISTS');
    const offer = await prisma.supplierMaterial.findUniqueOrThrow({ where: { supplierId_materialId: { materialId: material.id, supplierId: ids.supplier } } });
    const details = await prisma.stockAdjustmentDetail.findMany({ where: { materialId: material.id, supplierId: ids.supplier } });
    expect(details).toHaveLength(1);
    expect(Number(details[0].previousStock)).toBe(0);
    expect(Number(offer.currentStock)).toBe(Number(details[0].newStock));
  });

  it('rechaza un ajuste abierto antes de una entrada y conserva stock e historia', async () => {
    const created = await request(app).post('/wastes').send(wasteBody()).expect(200);
    const original = created.body.waste;
    await entry(original.id, { operationId: randomUUID(), quantity: 2 }).expect(200);
    const updated = await getStock(original.id);
    expect(updated.version).toBeGreaterThan(original.version);
    await request(app).patch(`/wastes/${original.id}/stock`).send({
      newStock: 4, reasonId: ids.reason, expectedVersion: original.version
    }).expect(409).expect(result => expect(result.body.code).toBe('RECORD_VERSION_CONFLICT'));
    expect(Number((await getStock(original.id)).currentStock)).toBe(5);
    expect(await prisma.wasteStockAdjustmentDetail.count({ where: { wasteId: original.id } })).toBe(0);
  });

  it('rechaza una edición de cliente desactualizada sin sobrescribir al ganador', async () => {
    const original = await prisma.client.findUniqueOrThrow({ where: { id: ids.client } });
    await request(app).put(`/clients/${ids.client}`).send({ name: 'Cliente actualizado', isActive: true, expectedVersion: original.version }).expect(200);
    await request(app).put(`/clients/${ids.client}`).send({ name: 'Captura vieja', isActive: false, expectedVersion: original.version }).expect(409);
    const saved = await prisma.client.findUniqueOrThrow({ where: { id: ids.client } });
    expect(saved.name).toBe('Cliente actualizado');
    expect(saved.isActive).toBe(true);
    await request(app).put(`/clients/${ids.client}`).send({ name: 'Sin versión', isActive: true }).expect(400);
  });

  it('el duplicado concurrente de merma devuelve el registro para abrir Agregar stock', async () => {
    const body = wasteBody();
    const results = await runContendedOperations({
      prisma, table: 'Waste',
      lock: tx => tx.$queryRaw`SELECT "id" FROM "Supplier" WHERE "id" = ${ids.supplier}::uuid FOR UPDATE`,
      actions: [randomUUID(), randomUUID()].map(operationId => () => request(app).post('/wastes').send({ ...body, operationId }))
    });
    expect(results.map(result => result.status).sort()).toEqual([200, 409]);
    const winner = results.find(result => result.status === 200).body.waste;
    const conflict = results.find(result => result.status === 409).body;
    expect(conflict.code).toBe('WASTE_ALREADY_EXISTS');
    expect(conflict.meta.waste.id).toBe(winner.id);
    expect(Number((await getStock(winner.id)).currentStock)).toBe(3);
  });
});


describe('versiones compartidas y cambios SQL (DP-CON-002)', () => {
  it.each(['MATERIAL', 'CONSUMABLE'])('revierte también el Material si la oferta %s cambió por SQL', async type => {
    const material = await prisma.material.create({ data: {
      name: `IT Write Version ${randomUUID()}`, type, presentationId: ids.presentation, unitMeasureId: ids.unit,
      supplierMaterials: { create: { supplierId: ids.supplier, maxUnitCost: 10 } }
    }, include: { supplierMaterials: true } });
    materialIds.push(material.id);
    const offer = material.supplierMaterials[0];
    await prisma.$executeRaw`UPDATE "SupplierMaterial" SET "currentStock" = 2, "convertedQuantity" = 2 WHERE "id" = ${offer.id}::uuid`;
    const url = type === 'MATERIAL' ? '/materials' : '/consumables';
    await request(app).patch(`${url}/${material.id}`).send({
      name: 'Captura desactualizada', supplierId: ids.supplier, maxUnitCost: 5, isActive: false,
      expectedVersion: offer.version, expectedMaterialVersion: material.version
    }).expect(409).expect(result => expect(result.body.code).toBe('RECORD_VERSION_CONFLICT'));
    const savedMaterial = await prisma.material.findUniqueOrThrow({ where: { id: material.id } });
    const savedOffer = await prisma.supplierMaterial.findUniqueOrThrow({ where: { id: offer.id } });
    expect(savedMaterial.name).toBe(material.name);
    expect(savedMaterial.version).toBe(material.version);
    expect(savedOffer.version).toBe(offer.version + 1);
    expect(savedOffer.isActive).toBe(true);
    expect(Number(savedOffer.currentStock)).toBe(2);
  });

  it('una edición de usuario desactualizada no reemplaza su asignación de acceso', async () => {
    const original = await prisma.user.findUniqueOrThrow({ where: { id: ids.user } });
    const body = { name: `Write${suffix}`, personId: null, roleId: ids.role, departmentId: ids.department, expectedVersion: original.version };
    await request(app).patch(`/users/${ids.user}`).send(body).expect(200);
    await request(app).patch(`/users/${ids.user}`).send({ ...body, name: `Old${suffix}` }).expect(409);
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: ids.user }, include: { accesses: true } });
    expect(saved.name).toBe(body.name);
    expect(saved.accesses).toHaveLength(1);
    expect(saved.accesses[0].roleId).toBe(ids.role);
    expect(saved.accesses[0].departmentId).toBe(ids.department);
  });
});

describe('plantillas paginadas en SQL (DP-PERF-001)', () => {
  it('conserva cada rollo, agrupa hojas por ancho y mantiene costo y total fuera de página', async () => {
    ids.rollPresentation = (await prisma.presentation.create({ data: { name: ' rollo ' } })).id;
    const name = `IT Template ${suffix}`;
    for (const [presentationId, height, maxUnitCost, type, isActive] of [
      [ids.rollPresentation, 20, 20, 'MATERIAL', true],
      [ids.rollPresentation, 40, 25, 'MATERIAL', true],
      [ids.presentation, 2, 30, 'MATERIAL', true],
      [ids.presentation, 3, 40, 'MATERIAL', true],
      [ids.presentation, 4, 90, 'CONSUMABLE', true],
      [ids.presentation, 5, 80, 'MATERIAL', false]
    ]) {
      const material = await prisma.material.create({ data: {
        name, type, presentationId, unitMeasureId: ids.unit, base: 1.5, height,
        supplierMaterials: { create: { supplierId: ids.supplier, maxUnitCost, isActive } }
      } });
      materialIds.push(material.id);
    }
    const result = await request(app).get('/templates').query({ supplierId: ids.supplier, search: name, length: 10 }).expect(200);
    expect(result.body.recordsTotal).toBe(3);
    expect(result.body.data).toHaveLength(3);
    expect(result.body.data.filter(row => row.presentation.id === ids.rollPresentation)).toHaveLength(2);
    expect(result.body.data.map(row => Number(row.maxUnitCost))).toEqual([40, 40, 40]);
    expect(result.body.data.every(row => row.supplierMaterials.length === 1)).toBe(true);
    const page = await request(app).get('/templates').query({ supplierId: ids.supplier, search: name, start: 1, length: 1 }).expect(200);
    expect(page.body.recordsTotal).toBe(3);
    expect(page.body.data[0].id).toBe(result.body.data[1].id);
    const empty = await request(app).get('/templates').query({ supplierId: ids.supplier, search: name, start: 10, length: 1 }).expect(200);
    expect(empty.body).toEqual({ data: [], recordsTotal: 3, recordsFiltered: 3 });
  });
});
