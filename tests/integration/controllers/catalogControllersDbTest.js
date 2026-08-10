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
  reason: `IT Reason ${testSuffix}`
};

let prisma;
let app;

const cleanupCatalogs = async () => {
  await prisma.stockAdjustmentReason.deleteMany({ where: { name: { startsWith: 'IT Reason ' } } });
  await prisma.fulfillmentStatus.deleteMany({ where: { name: { startsWith: 'IT Status ' } } });
  await prisma.unitMeasure.deleteMany({ where: { name: { startsWith: 'IT Unit ' } } });
  await prisma.presentation.deleteMany({ where: { name: { startsWith: 'IT Presentation ' } } });
  await prisma.role.deleteMany({ where: { name: { startsWith: 'IT Role ' } } });
  await prisma.department.deleteMany({ where: { name: { startsWith: 'IT Department ' } } });
};

describe('catalog controllers database integration', () => {
  beforeAll(async () => {
    const [prismaModule, department, role, presentation, unit, status, reason] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/controllers/api/admin/departmentController.js'),
      import('../../../src/controllers/api/admin/roleController.js'),
      import('../../../src/controllers/api/warehouse/presentationController.js'),
      import('../../../src/controllers/api/warehouse/unitMeasureController.js'),
      import('../../../src/controllers/api/warehouse/fulfillmentStatusController.js'),
      import('../../../src/controllers/api/warehouse/reasonController.js')
    ]);
    prisma = prismaModule.prisma;
    app = createControllerTestApp({
      registerRoutes: (router) => {
        router.get('/departments', department.getAllDepartments);
        router.get('/roles', role.getAllRoles);
        router.get('/presentations', presentation.getAllPresentations);
        router.get('/units', unit.getAllUnitMeasures);
        router.get('/statuses', status.getAllFulfillmentStatuses);
        router.get('/reasons', reason.getAllReasons);
      }
    });

    await cleanupCatalogs();
  });


  it('guarda catálogos en DATABASE_TEST_URL y los lee desde sus controllers', async () => {
    const [department, presentation, unit] = await Promise.all([
      prisma.department.create({ data: { name: names.department } }),
      prisma.presentation.create({ data: { name: names.presentation } }),
      prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } }),
      prisma.role.create({ data: { name: names.role } }),
      prisma.fulfillmentStatus.create({ data: { name: names.status } }),
      prisma.stockAdjustmentReason.create({ data: { name: names.reason } })
    ]);

    const cases = [
      ['/departments', names.department, { id: department.id, name: names.department }],
      ['/roles', names.role, { name: names.role }],
      ['/presentations', names.presentation, { id: presentation.id, name: names.presentation }],
      ['/units', names.unit, { id: unit.id, name: names.unit, symbol: names.unitSymbol }],
      ['/statuses', names.status, { name: names.status }],
      ['/reasons', names.reason, { name: names.reason }]
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
});
