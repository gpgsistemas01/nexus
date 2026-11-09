import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { createInventoryImportFixture } from '../../helpers/inventoryImportFixture.js';
import { ROLE_KEYS } from '../../../src/constants/roles.js';

let prisma, fixture, app, cookie, deniedCookie, previousSecret;
const ids = {}, statuses = {};
const cutoffDate = '2026-10-31T23:00:00.000Z';
const preview = async (resource, page = 1) => (await request(app).get(`/historical/${resource}/preview`)
  .query({ cutoffDate, page }).set('Cookie', cookie).expect(200)).body.preview;
const capture = documents => ({ operationId: randomUUID(), cutoffDate, deliveredAt: null, reason: 'Entregas físicas verificadas con almacén',
  declaredDelivered: true, documents: documents.map(({ id, revision }) => ({ id, revision })) });
const confirm = (resource, command) => request(app).post(`/historical/${resource}/confirm`).set('Cookie', cookie).send(command)
  .expect(response => { if (response.status === 500) throw new Error(JSON.stringify(response.body)); });
const stockSnapshot = async () => JSON.parse(JSON.stringify(await prisma.$transaction([
  prisma.supplierMaterial.findMany({ where: { supplierId: fixture.suppliers[0].id }, orderBy: { id: 'asc' } }),
  prisma.waste.findUnique({ where: { id: ids.waste } }),
  prisma.inventoryMovement.count(), prisma.movementDetail.count(), prisma.wasteMovement.count(), prisma.wasteMovementDetail.count()
])));
const seedIssue = async (resource, overrides = {}) => {
  const isWaste = resource === 'wastes';
  const supplied = overrides.supplied ?? 0;
  const canceled = overrides.canceled ?? false;
  const name = canceled ? 'Cancelado' : supplied ? 'Surtido parcial' : 'Pendiente';
  const header = { referenceNumber: `HIST-${randomUUID()}`, requestDate: new Date('2026-09-01T12:00:00Z'),
    projectNumber: overrides.projectNumber ?? 'HIST-01', departmentName: 'Área histórica', departmentId: ids.department,
    requesterId: ids.person, requesterName: 'Responsable', advisorId: ids.person, advisorName: 'Responsable',
    clientId: ids.client, clientName: 'Cliente histórico', statusId: statuses[canceled ? 'Cancelada' : 'Aprobada'], fulfillmentStatusId: statuses[name] };
  const detail = { materialName: 'Entrega histórica', quantity: 5, convertedQuantity: 30, suppliedQuantity: supplied,
    returnedQuantity: overrides.returned ?? 0, isSupplied: false, projectConvertedQuantity: null, convertedQuantityDifference: null,
    fulfillmentStatusId: statuses[name] };
  return isWaste ? prisma.wasteIssue.create({ data: { ...header, createdById: fixture.user.id,
    details: { create: { ...detail, wasteId: ids.waste } } }, include: { details: true } })
    : prisma.goodsIssue.create({ data: { ...header, type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE',
      details: { create: { ...detail, materialId: ids[resource], supplierId: fixture.suppliers[0].id, maxUnitCost: overrides.cost ?? 0 } } }, include: { details: true } });
};

describe('entregas históricas HTTP: reconocimiento, concurrencia y ausencia de descuento de stock', () => {
  beforeAll(async () => {
    previousSecret = process.env.JWT_SECRET_ACCESS;
    process.env.JWT_SECRET_ACCESS = randomUUID();
    prisma = (await import('../../../src/lib/prisma.js')).prisma;
    fixture = await createInventoryImportFixture(prisma);
    for (const name of ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado']) statuses[name] = (await prisma.fulfillmentStatus.upsert({ where: { name }, update: {}, create: { name } })).id;
    for (const name of ['Aprobada', 'Cancelada']) statuses[name] = (await prisma.status.upsert({ where: { name }, update: {}, create: { name } })).id;
    ids.department = (await prisma.department.create({ data: { name: `HIST ${fixture.suffix}` } })).id;
    ids.person = (await prisma.person.create({ data: { fullName: `HIST ${fixture.suffix}` } })).id;
    ids.client = (await prisma.client.create({ data: { name: `HIST ${fixture.suffix}`, advisorId: ids.person } })).id;
    for (const [resource, type] of [['materials', 'MATERIAL'], ['consumables', 'CONSUMABLE']]) {
      ids[resource] = (await prisma.material.create({ data: { name: `HIST ${resource} ${fixture.suffix}`, type,
        presentationId: fixture.presentation.id, unitMeasureId: fixture.unit.id, base: 2, height: 3 } })).id;
      await prisma.supplierMaterial.create({ data: { materialId: ids[resource], supplierId: fixture.suppliers[0].id, currentStock: 0, maxUnitCost: 0 } });
    }
    ids.waste = (await prisma.waste.create({ data: { name: `HIST merma ${fixture.suffix}`, supplierId: fixture.suppliers[0].id,
      presentationId: fixture.presentation.id, unitMeasureId: fixture.unit.id, base: 2, height: 3, currentStock: 0 } })).id;
    const historical = (await import('../../../src/routes/api/warehouse/historicalDeliveryApiRoute.js')).default;
    const materials = (await import('../../../src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js')).default;
    const wastes = (await import('../../../src/routes/api/warehouse/wasteIssueApiRoute.js')).default;
    app = createControllerTestApp({ registerRoutes: router => router.use(cookieParser()).use('/historical', historical).use('/materials', materials).use('/wastes', wastes) });
    cookie = `accessToken=${jwt.sign({ id: fixture.user.id }, process.env.JWT_SECRET_ACCESS)}`;
    deniedCookie = `accessToken=${jwt.sign({ id: fixture.denied.id }, process.env.JWT_SECRET_ACCESS)}`;
  });
  afterAll(async () => {
    const goods = (await prisma.goodsIssue.findMany({ where: { departmentId: ids.department }, select: { id: true } })).map(item => item.id);
    const wastes = (await prisma.wasteIssue.findMany({ where: { departmentId: ids.department }, select: { id: true } })).map(item => item.id);
    await prisma.goodsIssueReturn.deleteMany({ where: { goodsIssueId: { in: goods } } });
    await prisma.movementDetail.deleteMany({ where: { movement: { goodsIssueId: { in: goods } } } });
    await prisma.inventoryMovement.deleteMany({ where: { goodsIssueId: { in: goods } } });
    await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssueId: { in: goods } } });
    await prisma.goodsIssue.deleteMany({ where: { id: { in: goods } } });
    await prisma.wasteIssueReturn.deleteMany({ where: { wasteIssueId: { in: wastes } } });
    await prisma.wasteMovementDetail.deleteMany({ where: { movement: { wasteIssueId: { in: wastes } } } });
    await prisma.wasteMovement.deleteMany({ where: { wasteIssueId: { in: wastes } } });
    await prisma.wasteIssue.deleteMany({ where: { id: { in: wastes } } });
    await prisma.historicalDeliveryBatch.deleteMany({ where: { userId: fixture.user.id } });
    await prisma.client.delete({ where: { id: ids.client } });
    await prisma.person.delete({ where: { id: ids.person } });
    await prisma.department.delete({ where: { id: ids.department } });
    await fixture.cleanup();
    if (previousSecret === undefined) delete process.env.JWT_SECRET_ACCESS; else process.env.JWT_SECRET_ACCESS = previousSecret;
  });

  it.each(['materials', 'consumables', 'wastes'])('reconoce pendientes y parciales de %s con stock cero; conserva devoluciones y valores desconocidos', async resource => {
    const issues = [await seedIssue(resource), await seedIssue(resource, { supplied: 2, returned: 1 })];
    const read = await preview(resource);
    const candidates = read.documents.filter(item => issues.some(issue => issue.id === item.id));
    expect(candidates.map(item => item.details[0].suppliedQuantity)).toEqual(expect.arrayContaining([0, 2]));
    const command = capture(candidates);
    const before = await stockSnapshot();
    const response = await confirm(resource, { ...command, currentStock: 999, costsVerified: true, role: 'admin' }).expect(200);
    expect(response.body.receipt).toMatchObject({ costsVerified: false, deliveredAt: null, declaredDelivered: true });
    expect(await stockSnapshot()).toEqual(before);
    for (const [index, issue] of issues.entries()) {
      const db = resource === 'wastes' ? prisma.wasteIssue : prisma.goodsIssue;
      const saved = await db.findUnique({ where: { id: issue.id }, include: { details: true, fulfillmentStatus: true } });
      expect(saved.fulfillmentStatus.name).toBe('Surtido');
      expect(Number(saved.details[0].suppliedQuantity)).toBe(5);
      expect(Number(saved.details[0].returnedQuantity)).toBe(index);
      expect(saved.details[0].projectConvertedQuantity).toBeNull();
      expect(saved.details[0].convertedQuantityDifference).toBeNull();
      if (resource !== 'wastes') expect(Number(saved.details[0].maxUnitCost)).toBe(0);
    }
    const repeated = await confirm(resource, command).expect(200);
    expect(repeated.body.receipt).toEqual(response.body.receipt);
    expect(repeated.body.replayed).toBe(true);
    await confirm(resource, { ...command, reason: 'Otra captura' }).expect(409);
    await confirm(resource, { ...command, operationId: randomUUID() }).expect(409);
    expect(await stockSnapshot()).toEqual(before);
    expect(await prisma.historicalDeliveryBatch.count({ where: { id: response.body.receipt.id } })).toBe(1);
  });

  it('protege permisos, declaración, corte y aislamiento entre materiales y consumibles', async () => {
    await request(app).get('/historical/materials/preview').query({ cutoffDate }).expect(401);
    await request(app).get('/historical/materials/preview').query({ cutoffDate }).set('Cookie', deniedCookie).expect(403);
    const issue = await seedIssue('consumables');
    const original = (await preview('consumables')).documents.find(item => item.id === issue.id);
    const command = capture([original]);
    await confirm('materials', command).expect(404);
    await confirm('consumables', { ...command, declaredDelivered: false }).expect(400);
    await confirm('consumables', { ...command, cutoffDate: '2099-01-01T00:00:00Z' }).expect(400);
    await confirm('consumables', { ...command, deliveredAt: '2026-11-01T00:00:00Z' }).expect(400);
    expect((await prisma.goodsIssue.findUnique({ where: { id: issue.id } })).historicalDeliveryBatchId).toBeNull();
  });

  it('rechaza revisiones viejas y canceladas y deja todo el lote sin efectos', async () => {
    const issues = [await seedIssue('materials'), await seedIssue('materials')];
    const command = capture((await preview('materials')).documents.filter(item => issues.some(issue => issue.id === item.id)));
    await prisma.goodsIssue.update({ where: { id: issues[1].id }, data: { statusId: statuses.Cancelada, fulfillmentStatusId: statuses.Cancelado } });
    const before = await stockSnapshot();
    await confirm('materials', command).expect(409);
    expect(await stockSnapshot()).toEqual(before);
    expect((await prisma.goodsIssueDetail.findUnique({ where: { id: issues[0].details[0].id } })).isSupplied).toBe(false);
    expect(await prisma.historicalDeliveryBatch.count({ where: { operationId: command.operationId } })).toBe(0);
    expect((await preview('materials')).documents.some(item => item.id === issues[1].id)).toBe(false);
  });

  it.each(['materials', 'wastes'])('una devolución histórica de %s exige entrada física actual y conserva datos sin verificar', async resource => {
    const issue = await seedIssue(resource);
    const candidate = (await preview(resource)).documents.find(item => item.id === issue.id);
    await confirm(resource, capture([candidate])).expect(200);
    if (resource === 'wastes') await prisma.waste.update({ where: { id: ids.waste }, data: { maxUnitCost: 100 } });
    const before = await stockSnapshot();
    const path = `/${resource}/${issue.id}/details/${issue.details[0].id}/returns`;
    await request(app).patch(path).set('Cookie', cookie).send({ returnQuantity: 1, observations: 'Retorno actual' }).expect(400);
    expect(await stockSnapshot()).toEqual(before);
    await request(app).patch(path).set('Cookie', cookie).send({ returnQuantity: 1, observations: 'Retorno físico actual', physicalReturnConfirmed: true }).expect(200);
    const offer = resource === 'wastes' ? await prisma.waste.findUnique({ where: { id: ids.waste } })
      : await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: fixture.suppliers[0].id, materialId: ids.materials } } });
    expect(Number(offer.currentStock)).toBe(1);
    expect(Number(offer.convertedQuantity)).toBe(6);
    const read = await request(app).get(`/${resource}/${issue.id}`).set('Cookie', cookie).expect(200);
    const document = read.body[resource === 'wastes' ? 'wasteIssue' : 'goodsIssue'];
    expect(document.historicalDeliveryBatch).toMatchObject({ reason: 'Entregas físicas verificadas con almacén' });
    if (resource === 'wastes') expect(document.details[0].maxUnitCost).toBeNull();
    const reports = await import('../../../src/services/warehouse/reportService.js');
    const report = resource === 'wastes' ? reports.findWasteIssueReportRows : reports.findGoodsIssueReportRows;
    const rows = [];
    for await (const row of report({ type: 'MATERIAL', accesses: [{ roleKey: ROLE_KEYS.SYSTEM_ADMIN }] })) if (row.referenceNumber === issue.referenceNumber) rows.push(row);
    expect(rows).toHaveLength(1);
    expect(rows[0].historicalDeliveryNote).toContain('sin verificar');
    expect(rows[0].projectConvertedQuantity).toBeNull();
    expect(rows[0].convertedQuantityDifference).toBeNull();
    if (resource === 'wastes') {
      expect(rows[0].presentationName).toBe(fixture.presentation.name);
      expect(rows[0].convertedUnitMeasureName).toBe(fixture.unit.symbol);
    }
    const receipt = await prisma.historicalDeliveryBatch.findUnique({ where: { id: document.historicalDeliveryBatch.id } });
    expect(receipt.result.documents[0].recognized[0].quantity).toBe(5);
  });

  it('serializa el reconocimiento y el surtido normal; sólo la entrega nueva descuenta stock', async () => {
    await prisma.supplierMaterial.update({ where: { supplierId_materialId: { supplierId: fixture.suppliers[0].id, materialId: ids.materials } },
      data: { currentStock: 10, convertedQuantity: 60, maxUnitCost: 10 } });
    const issue = await seedIssue('materials', { cost: 10 });
    const original = (await preview('materials')).documents.find(item => item.id === issue.id);
    const movementCount = await prisma.inventoryMovement.count({ where: { goodsIssueId: issue.id } });
    const results = await Promise.all([
      confirm('materials', capture([original])),
      request(app).patch(`/materials/${issue.id}/details`).set('Cookie', cookie)
        .send({ details: [{ id: issue.details[0].id, quantityToSupply: 1, isSupplied: true,
          expectedSuppliedQuantity: 0, projectConvertedQuantity: 30 }] })
    ]);
    expect(results.map(item => item.status).sort()).toEqual([200, 409]);
    const normalSupplyWon = results[1].status === 200;
    const offer = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: fixture.suppliers[0].id, materialId: ids.materials } } });
    expect(Number(offer.currentStock)).toBe(normalSupplyWon ? 9 : 10);
    expect(await prisma.inventoryMovement.count({ where: { goodsIssueId: issue.id } })).toBe(movementCount + (normalSupplyWon ? 1 : 0));
  });

  it('dos confirmaciones concurrentes con la misma captura devuelven el mismo recibo', async () => {
    const issue = await seedIssue('wastes');
    const original = (await preview('wastes')).documents.find(item => item.id === issue.id);
    const command = capture([original]);
    const before = await stockSnapshot();
    const results = await Promise.all([confirm('wastes', command), confirm('wastes', command)]);
    expect(results.map(item => item.status)).toEqual([200, 200]);
    expect(results[0].body.receipt).toEqual(results[1].body.receipt);
    expect(await prisma.historicalDeliveryBatch.count({ where: { operationId: command.operationId } })).toBe(1);
    expect(await stockSnapshot()).toEqual(before);
  });

  it('un fallo tardío revierte documento, partidas y recibo de todo el lote histórico', async () => {
    const issues = [await seedIssue('materials'), await seedIssue('materials')].sort((a, b) => a.id.localeCompare(b.id));
    const command = capture((await preview('materials')).documents.filter(item => issues.some(issue => issue.id === item.id)));
    const before = await stockSnapshot();
    const documents = await prisma.goodsIssue.findMany({ where: { id: { in: issues.map(issue => issue.id) } }, include: { details: true }, orderBy: { id: 'asc' } });
    await prisma.$executeRawUnsafe(`CREATE FUNCTION test_historical_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.id = '${issues[1].id}'::uuid AND NEW."historicalDeliveryBatchId" IS NOT NULL THEN RAISE EXCEPTION 'test historical failure'; END IF; RETURN NEW; END $$`);
    await prisma.$executeRawUnsafe('CREATE TRIGGER test_historical_failure BEFORE UPDATE ON "GoodsIssue" FOR EACH ROW EXECUTE FUNCTION test_historical_failure()');
    try {
      await request(app).post('/historical/materials/confirm').set('Cookie', cookie).send(command).expect(500);
      expect(await prisma.goodsIssue.findMany({ where: { id: { in: issues.map(issue => issue.id) } }, include: { details: true }, orderBy: { id: 'asc' } })).toEqual(documents);
      expect(await prisma.historicalDeliveryBatch.count({ where: { operationId: command.operationId } })).toBe(0);
      expect(await stockSnapshot()).toEqual(before);
    } finally {
      await prisma.$executeRawUnsafe('DROP TRIGGER test_historical_failure ON "GoodsIssue"');
      await prisma.$executeRawUnsafe('DROP FUNCTION test_historical_failure()');
    }
  });

  it('resuelve cien pendientes en un lote y rechaza el límite excedido sin nuevos efectos', async () => {
    const issues = await Promise.all(Array.from({ length: 100 }, () => seedIssue('wastes', { projectNumber: 'BATCH-100' })));
    const issueIds = new Set(issues.map(issue => issue.id));
    const documents = [];
    let page = 1;
    let hasMore = true;
    while (hasMore && documents.length < issues.length) {
      const read = await preview('wastes', page);
      documents.push(...read.documents.filter(item => issueIds.has(item.id)));
      hasMore = read.hasMore;
      page += 1;
    }
    expect(documents).toHaveLength(100);
    const command = capture(documents);
    const before = await stockSnapshot();
    const completed = await confirm('wastes', command).expect(200);
    expect(completed.body.receipt.documents).toHaveLength(100);
    expect(await prisma.wasteIssue.count({ where: { historicalDeliveryBatchId: completed.body.receipt.id, fulfillmentStatus: { name: 'Surtido' } } })).toBe(100);
    expect(await stockSnapshot()).toEqual(before);
    await confirm('wastes', { ...command, operationId: randomUUID(), documents: [...command.documents, { id: randomUUID(), revision: 'b'.repeat(64) }] }).expect(400);
    expect(await stockSnapshot()).toEqual(before);
  });
});
