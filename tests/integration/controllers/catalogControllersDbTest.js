import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  department: `IT Department ${testSuffix}`,
  role: `IT Role ${testSuffix}`,
  presentation: `IT Presentation ${testSuffix}`,
  unit: `IT Unit ${testSuffix}`,
  unitSymbol: `iu${testSuffix.slice(-4)}`,
  status: `IT Status ${testSuffix}`,
  reason: `IT Reason ${testSuffix}`,
  operationalStatus: `IT Operational ${testSuffix}`
};

let prisma;
let app;

const cleanupCatalogs = async () => {
  await prisma.stockAdjustmentReason.deleteMany({ where: { name: { startsWith: 'IT Reason ' } } });
  await prisma.fulfillmentStatus.deleteMany({ where: { name: { startsWith: 'IT Status ' } } });
  await prisma.status.deleteMany({ where: { name: { startsWith: 'IT Operational ' } } });
  await prisma.unitMeasure.deleteMany({ where: { name: { startsWith: 'IT Unit ' } } });
  await prisma.presentation.deleteMany({ where: { name: { startsWith: 'IT Presentation ' } } });
  await prisma.role.deleteMany({ where: { name: { startsWith: 'IT Role ' } } });
  await prisma.department.deleteMany({ where: { name: { startsWith: 'IT Department ' } } });
};

describe('catalog controllers database integration', () => {
  beforeAll(async () => {
    const [prismaModule, department, role, presentation, unit, fulfillmentStatus, reason, status] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/controllers/api/admin/departmentController.js'),
      import('../../../src/controllers/api/admin/roleController.js'),
      import('../../../src/controllers/api/warehouse/presentationController.js'),
      import('../../../src/controllers/api/warehouse/unitMeasureController.js'),
      import('../../../src/controllers/api/warehouse/fulfillmentStatusController.js'),
      import('../../../src/controllers/api/warehouse/reasonController.js'),
      import('../../../src/controllers/api/admin/statusController.js')
    ]);
    prisma = prismaModule.prisma;
    app = createControllerTestApp({
      registerRoutes: (router) => {
        router.get('/departments', department.getAllDepartments);
        router.post('/departments', department.registerDepartment);
        router.put('/departments/:id', department.editDepartment);
        router.delete('/departments/:id', department.removeDepartment);
        router.get('/roles', role.getAllRoles);
        router.post('/roles', role.registerRole);
        router.put('/roles/:id', role.editRole);
        router.delete('/roles/:id', role.removeRole);
        router.get('/presentations', presentation.getAllPresentations);
        router.post('/presentations', presentation.registerPresentation);
        router.put('/presentations/:id', presentation.editPresentation);
        router.delete('/presentations/:id', presentation.removePresentation);
        router.get('/units', unit.getAllUnitMeasures);
        router.post('/units', unit.registerUnitMeasure);
        router.put('/units/:id', unit.editUnitMeasure);
        router.delete('/units/:id', unit.removeUnitMeasure);
        router.get('/statuses', fulfillmentStatus.getAllFulfillmentStatuses);
        router.post('/statuses', fulfillmentStatus.registerFulfillmentStatus);
        router.put('/statuses/:id', fulfillmentStatus.editFulfillmentStatus);
        router.delete('/statuses/:id', fulfillmentStatus.removeFulfillmentStatus);
        router.get('/reasons', reason.getAllReasons);
        router.post('/reasons', reason.registerReason);
        router.put('/reasons/:id', reason.editReason);
        router.delete('/reasons/:id', reason.removeReason);
        router.get('/operational-statuses', status.getAllStatuses);
        router.post('/operational-statuses', status.registerStatus);
        router.put('/operational-statuses/:id', status.editStatus);
        router.delete('/operational-statuses/:id', status.removeStatus);
      }
    });

    await cleanupCatalogs();
  });


  it('guarda catálogos en DATABASE_TEST_URL y los lee desde sus controllers', async () => {
    const department = await prisma.department.create({ data: { name: names.department } });
    const presentation = await prisma.presentation.create({ data: { name: names.presentation } });
    const unit = await prisma.unitMeasure.create({
      data: { name: names.unit, symbol: names.unitSymbol }
    });
    await prisma.role.create({ data: { name: names.role } });
    await prisma.fulfillmentStatus.create({ data: { name: names.status } });
    await prisma.stockAdjustmentReason.create({ data: { name: names.reason } });
    await prisma.status.create({ data: { name: names.operationalStatus } });

    const cases = [
      ['/departments', names.department, { id: department.id, name: names.department }],
      ['/roles', names.role, { name: names.role }],
      ['/presentations', names.presentation, { id: presentation.id, name: names.presentation }],
      ['/units', names.unit, { id: unit.id, name: names.unit, symbol: names.unitSymbol }],
      ['/statuses', names.status, { name: names.status }],
      ['/reasons', names.reason, { name: names.reason }],
      ['/operational-statuses', names.operationalStatus, { name: names.operationalStatus }]
    ];

    for (const [path, search, expected] of cases) {
      const response = await request(app)
        .get(path)
        .query({ 'search[value]': search })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        recordsFiltered: 1,
        data: [expect.objectContaining(expected)]
      });
    }
  });

  it('crea, actualiza y elimina cada catálogo administrable', async () => {
    const cases = [
      ['/departments', prisma.department, { name: `${names.department} CRUD` }],
      ['/roles', prisma.role, { name: `${names.role} CRUD` }],
      ['/presentations', prisma.presentation, { name: `${names.presentation} CRUD` }],
      ['/units', prisma.unitMeasure, { name: `${names.unit} CRUD`, symbol: `c${names.unitSymbol}` }],
      ['/statuses', prisma.fulfillmentStatus, { name: `${names.status} CRUD` }],
      ['/reasons', prisma.stockAdjustmentReason, { name: `${names.reason} CRUD`, isActive: true }],
      ['/operational-statuses', prisma.status, { name: `${names.operationalStatus} CRUD` }]
    ];

    for (const [path, model, payload] of cases) {
      const created = await request(app).post(path).send(payload).expect(201);
      const id = created.body.entry.id;
      const updatedPayload = { ...payload, name: `${payload.name} updated` };

      await request(app).put(`${path}/${id}`).send(updatedPayload).expect(200);
      await expect(model.findUnique({ where: { id } })).resolves.toMatchObject(updatedPayload);

      await request(app).delete(`${path}/${id}`).expect(200);
      await expect(model.findUnique({ where: { id } })).resolves.toBeNull();
    }
  });
});
