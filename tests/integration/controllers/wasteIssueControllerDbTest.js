import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import xlsx from 'xlsx';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const suffix = Math.random().toString(36).slice(2, 8);
const ids = {};
let app;
let prisma;

const cleanCreatedRecords = async () => {
  if (!prisma) return;
  const issues = await prisma.wasteIssue.findMany({
    where: { createdBy: { name: { startsWith: `ITWasteIssueUser${ suffix }` } } },
    select: { id: true }
  });
  const issueIds = issues.map(({ id }) => id);
  const movements = await prisma.wasteMovement.findMany({ where: { wasteIssueId: { in: issueIds } }, select: { id: true } });
  await prisma.wasteIssueReturn.deleteMany({ where: { wasteIssueId: { in: issueIds } } });
  await prisma.wasteMovementDetail.deleteMany({ where: { movementId: { in: movements.map(({ id }) => id) } } });
  await prisma.wasteMovement.deleteMany({ where: { id: { in: movements.map(({ id }) => id) } } });
  await prisma.wasteIssue.deleteMany({ where: { id: { in: issueIds } } });
  await prisma.waste.deleteMany({ where: { id: ids.waste } });
  await prisma.supplierMaterial.deleteMany({ where: { id: ids.supplierMaterial } });
  await prisma.material.deleteMany({ where: { id: ids.material } });
  await prisma.supplier.deleteMany({ where: { id: ids.supplier } });
  await prisma.user.deleteMany({ where: { id: ids.user } });
  await prisma.client.deleteMany({ where: { id: ids.client } });
  await prisma.person.deleteMany({ where: { id: { in: [ids.requester, ids.advisor] } } });
  await prisma.department.deleteMany({ where: { id: ids.department } });
  await prisma.presentation.deleteMany({ where: { id: ids.presentation } });
  await prisma.unitMeasure.deleteMany({ where: { id: ids.unit } });
};

describe('waste issue controller database integration', () => {
  beforeAll(async () => {
    const prismaModule = await import('../../../src/lib/prisma.js');
    const controller = await import('../../../src/controllers/api/warehouse/wasteIssueController.js');
    const movementController = await import('../../../src/controllers/api/admin/movementController.js');
    const reportController = await import('../../../src/controllers/api/warehouse/reportController.js');
    prisma = prismaModule.prisma;
    app = createControllerTestApp({
      registerRoutes: router => {
        router.use((req, _res, next) => { req.user = { id: ids.user }; next(); });
        router.get('/waste-issues', controller.getAllWasteIssues);
        router.get('/waste-movements', movementController.getAllWasteMovements);
        router.get('/waste-issues/excel', reportController.exportWasteIssueReportExcel);
        router.post('/waste-issues', controller.registerWasteIssue);
        router.patch('/waste-issues/:id', controller.editWasteIssue);
        router.patch('/waste-issues/:id/header', controller.editWasteIssueHeader);
        router.patch('/waste-issues/:id/details', controller.editWasteIssueDetails);
        router.patch('/waste-issues/:id/details/:detailId/returns', controller.returnWasteIssueDetail);
      }
    });

    const statuses = ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado'];

    for (const name of statuses) {
      await prisma.fulfillmentStatus.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
    const unit = await prisma.unitMeasure.create({ data: { name: `IT WI Unit ${ suffix }`, symbol: `w${ suffix.slice(0, 4) }` } });
    const presentation = await prisma.presentation.create({ data: { name: `IT WasteIssue Presentation ${ suffix }` } });
    const supplier = await prisma.supplier.create({
      data: { codeNumber: Number.parseInt(Date.now().toString().slice(-8)), code: `WI${ suffix }`, legalName: `IT WasteIssue Supplier Legal ${ suffix }`, tradeName: `IT WasteIssue Supplier ${ suffix }` }
    });
    const material = await prisma.material.create({
      data: { name: `IT WasteIssue Material ${ suffix }`, unitMeasureId: unit.id, presentationId: presentation.id }
    });
    const supplierMaterial = await prisma.supplierMaterial.create({
      data: { materialId: material.id, supplierId: supplier.id, maxUnitCost: 25 }
    });
    const waste = await prisma.waste.create({ data: { supplierMaterialId: supplierMaterial.id, currentStock: 10, convertedQuantity: 10 } });
    const user = await prisma.user.create({ data: { name: `ITWasteIssueUser${ suffix }`, password: 'integration-only' } });
    const department = await prisma.department.create({ data: { name: `IT Waste Issue Area ${ suffix }` } });
    const requester = await prisma.person.create({ data: { fullName: `IT Waste Issue Requester ${ suffix }` } });
    const advisor = await prisma.person.create({ data: { fullName: `IT Waste Issue Advisor ${ suffix }` } });
    const client = await prisma.client.create({ data: { name: `IT Waste Issue Client ${ suffix }`, advisorId: advisor.id } });
    Object.assign(ids, {
      unit: unit.id, presentation: presentation.id, supplier: supplier.id, material: material.id,
      supplierMaterial: supplierMaterial.id, waste: waste.id, user: user.id,
      department: department.id, requester: requester.id, advisor: advisor.id, client: client.id
    });
  });

  afterAll(cleanCreatedRecords);

  it('crea y surte una salida por HTTP, persiste estados, stock y movimiento', async () => {
    const created = await request(app).post('/waste-issues').send({
      requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client, departmentId: ids.department, projectNumber: 'PR-100',
      requestDate: '2026-08-11T12:30:00.000Z',
      observations: 'Integración de salida de merma',
      details: [{ wasteId: ids.waste, quantity: 4 }]
    }).expect(201);

    expect(created.body.wasteIssue.fulfillmentStatus).toMatchObject({
      name: 'Pendiente'
    });
    expect(created.body.wasteIssue.details).toHaveLength(1);
    expect(created.body.wasteIssue.details[0]).toMatchObject({
      quantity: '4',
      materialName: `IT WasteIssue Material ${ suffix }`,
      convertedQuantity: '4',
      isSupplied: false,
      fulfillmentStatus: { name: 'Pendiente' }
    });
    const issueId = created.body.wasteIssue.id;
    const edited = await request(app).patch(`/waste-issues/${ issueId }`).send({
      requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client, departmentId: ids.department, projectNumber: 'PR-101',
      requestDate: '2026-08-11T12:45:00.000Z',
      observations: 'Salida editada antes del surtido',
      details: [{ wasteId: ids.waste, quantity: 4 }]
    }).expect(200);
    const detailId = edited.body.wasteIssue.details[0].id;

    expect(edited.body.wasteIssue.details[0]).toMatchObject({
      maxUnitCost: '25',
      projectConvertedQuantity: null,
      convertedQuantityDifference: null
    });

    const listed = await request(app).get('/waste-issues').query({ start: 0, length: 10 }).expect(200);
    const listedIssue = listed.body.data.find(issue => issue.id === issueId);

    expect(listedIssue.details[0]).toMatchObject({
      maxUnitCost: '25',
      projectConvertedQuantity: null,
      convertedQuantityDifference: null
    });

    const supplied = await request(app).patch(`/waste-issues/${ issueId }/details`).send({
      details: [{ id: detailId, isSupplied: true, projectConvertedQuantity: 3.5 }]
    }).expect(200);

    expect(supplied.body.wasteIssue.details[0]).toMatchObject({
      maxUnitCost: '25',
      projectConvertedQuantity: '3.5',
      convertedQuantityDifference: '0.5'
    });

    await request(app).patch(`/waste-issues/${ issueId }/header`).send({
      requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client, departmentId: ids.department, projectNumber: 'PR-102',
      requestDate: '2026-08-11T13:00:00.000Z',
      observations: 'Encabezado editado después del surtido'
    }).expect(200);

    const rejectedEdit = await request(app).patch(`/waste-issues/${ issueId }`).send({
      requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client, departmentId: ids.department, projectNumber: 'PR-103',
      requestDate: '2026-08-11T14:00:00.000Z',
      observations: 'No debe aplicarse',
      details: [{ wasteId: ids.waste, quantity: 2 }]
    }).expect(409);
    expect(rejectedEdit.body.code).toBe('WASTE_ISSUE_ALREADY_SUPPLIED_CONFLICT');

    const issue = await prisma.wasteIssue.findUnique({
      where: { id: issueId },
      include: {
        fulfillmentStatus: true,
        details: { include: { fulfillmentStatus: true } }
      }
    });
    const waste = await prisma.waste.findUnique({ where: { id: ids.waste } });
    const movement = await prisma.wasteMovement.findFirst({
      where: { wasteIssueId: issueId },
      include: { details: true }
    });
    expect(issue.fulfillmentStatus.name).toBe('Surtido');
    expect(issue.observations).toBe('Encabezado editado después del surtido');
    expect(issue.details[0].fulfillmentStatus.name).toBe('Surtido');
    expect(Number(issue.details[0].projectConvertedQuantity)).toBe(3.5);
    expect(Number(issue.details[0].convertedQuantityDifference)).toBe(0.5);
    expect(Number(waste.currentStock)).toBe(6);
    expect(movement).toMatchObject({ type: 'ISSUE', details: [expect.objectContaining({ wasteIssueDetailId: detailId })] });
    expect(Number(movement.details[0].quantity)).toBe(-4);

    const report = await request(app)
      .get('/waste-issues/excel')
      .query({ wasteIssueId: issueId })
      .expect('Content-Type', /spreadsheetml/)
      .expect(200);
    const workbook = xlsx.read(report.body, { type: 'buffer' });
    const reportRows = xlsx.utils.sheet_to_json(workbook.Sheets['Salidas de merma']);

    expect(reportRows).toContainEqual(expect.objectContaining({
      Folio: issue.referenceNumber,
      Material: `IT WasteIssue Material ${ suffix }`,
      Proveedor: `IT WasteIssue Supplier ${ suffix }`,
      'Cantidad solicitada': 4,
      'Cantidad surtida': 4,
      'Cantidad de proyecto': 3.5,
      Diferencia: 0.5,
      'Estado del detalle': 'Surtido'
    }));

    const listedMovements = await request(app)
      .get('/waste-movements')
      .query({ start: 0, length: 10, materialId: ids.material, movementType: 'ISSUE' })
      .expect(200);
    expect(listedMovements.body.data).toContainEqual(expect.objectContaining({
      id: movement.details[0].id,
      type: 'Salida',
      referenceNumber: issue.referenceNumber,
      materialName: `IT WasteIssue Material ${ suffix }`,
      supplierName: `IT WasteIssue Supplier ${ suffix }`,
      quantity: '-4'
    }));

    const returned = await request(app)
      .patch(`/waste-issues/${ issueId }/details/${ detailId }/returns`)
      .send({ returnQuantity: 1, observations: 'Devolución parcial' })
      .expect(200);
    expect(returned.body.wasteIssueReturn).toMatchObject({
      materialName: `IT WasteIssue Material ${ suffix }`,
      observations: 'Devolución parcial',
      currentTotalReturnedQuantity: '0',
      newTotalReturnedQuantity: '1'
    });
    const wasteAfterReturn = await prisma.waste.findUnique({ where: { id: ids.waste } });
    expect(Number(wasteAfterReturn.currentStock)).toBe(7);

    await request(app)
      .patch(`/waste-issues/${ issueId }/details/${ detailId }/returns`)
      .send({ returnQuantity: 3, observations: 'Devolución total' })
      .expect(200);

    const canceledIssue = await prisma.wasteIssue.findUnique({
      where: { id: issueId },
      include: { fulfillmentStatus: true, details: { include: { fulfillmentStatus: true } } }
    });
    const wasteAfterFullReturn = await prisma.waste.findUnique({ where: { id: ids.waste } });

    expect(canceledIssue.fulfillmentStatus.name).toBe('Cancelado');
    expect(canceledIssue.details[0].fulfillmentStatus.name).toBe('Cancelado');
    expect(Number(canceledIssue.details[0].returnedQuantity)).toBe(4);
    expect(Number(wasteAfterFullReturn.currentStock)).toBe(10);

    const rejectedSupply = await request(app).patch(`/waste-issues/${ issueId }/details`).send({
      details: [{ id: detailId, isSupplied: true, projectConvertedQuantity: 3.5 }]
    }).expect(409);

    expect(rejectedSupply.body.code).toBe('WASTE_ISSUE_STATE_CONFLICT');
  });

  it('rechaza stock insuficiente y revierte toda la transacción', async () => {
    const before = await prisma.waste.findUnique({ where: { id: ids.waste } });
    const created = await request(app).post('/waste-issues').send({
      requesterId: ids.requester, advisorId: ids.advisor, clientId: ids.client, departmentId: ids.department, projectNumber: 'PR-200',
      requestDate: '2026-08-11T13:00:00.000Z',
      details: [{ wasteId: ids.waste, quantity: Number(before.currentStock) + 1 }]
    }).expect(201);
    const issueId = created.body.wasteIssue.id;
    const detailId = created.body.wasteIssue.details[0].id;

    const response = await request(app).patch(`/waste-issues/${ issueId }/details`).send({
      details: [{ id: detailId, isSupplied: true, projectConvertedQuantity: 1 }]
    }).expect(409);

    expect(response.body.code).toBe('WASTE_ISSUE_STOCK_CONFLICT');
    const after = await prisma.waste.findUnique({ where: { id: ids.waste } });
    const issue = await prisma.wasteIssue.findUnique({
      where: { id: issueId },
      include: { fulfillmentStatus: true, details: true }
    });
    const movements = await prisma.wasteMovement.count({
      where: { wasteIssueId: issueId }
    });
    expect(Number(after.currentStock)).toBe(Number(before.currentStock));
    expect(issue.fulfillmentStatus.name).toBe('Pendiente');
    expect(Number(issue.details[0].suppliedQuantity)).toBe(0);
    expect(issue.details[0].isSupplied).toBe(false);
    expect(movements).toBe(0);
  });
});
