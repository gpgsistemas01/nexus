import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  department: `IT Department ${testSuffix}`,
  role: `IT Role ${testSuffix}`,
  presentation: `IT Presentation ${testSuffix}`,
  unit: `IT Unit ${testSuffix}`,
  managedUnit: `IT MU ${testSuffix}`,
  unitSymbol: `iu${testSuffix.slice(-4)}`,
  status: `IT Status ${testSuffix}`,
  reason: `IT Reason ${testSuffix}`
};

let prisma;
let app;

const cleanupCatalogs = async () => {
  await prisma.stockAdjustmentReason.deleteMany({ where: { name: { startsWith: 'IT Reason ' } } });
  await prisma.fulfillmentStatus.deleteMany({ where: { name: { startsWith: 'IT Status ' } } });
  await prisma.unitMeasure.deleteMany({
    where: {
      OR: [
        { name: { startsWith: 'IT Unit ' } },
        { name: { startsWith: 'IT MU ' } },
        { name: { startsWith: 'IT Managed Unit ' } }
      ]
    }
  });
  await prisma.presentation.deleteMany({ where: { name: { startsWith: 'IT Presentation ' } } });
  await prisma.role.deleteMany({ where: { name: { startsWith: 'IT Role ' } } });
  await prisma.department.deleteMany({ where: { name: { startsWith: 'IT Department ' } } });
};

describe('catalog controllers database integration', () => {
  beforeAll(async () => {
    const [
      prismaModule,
      department,
      role,
      presentation,
      unit,
      status,
      reason,
      catalog,
      catalogValidations,
      validatorMiddleware
    ] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/controllers/api/admin/departmentController.js'),
      import('../../../src/controllers/api/admin/roleController.js'),
      import('../../../src/controllers/api/warehouse/presentationController.js'),
      import('../../../src/controllers/api/warehouse/unitMeasureController.js'),
      import('../../../src/controllers/api/warehouse/fulfillmentStatusController.js'),
      import('../../../src/controllers/api/warehouse/reasonController.js'),
      import('../../../src/controllers/api/admin/catalogController.js'),
      import('../../../src/validators/forms/catalogValidations.js'),
      import('../../../src/middleware/validatorMiddleware.js')
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
        router.get(
          '/managed/:catalog',
          catalogValidations.catalogNameValidation,
          validatorMiddleware.validate,
          catalog.getAllCatalogEntries
        );
        router.post(
          '/managed/:catalog',
          catalogValidations.catalogEntryValidation,
          validatorMiddleware.validate,
          catalog.registerCatalogEntry
        );
        router.put(
          '/managed/:catalog/:id',
          catalogValidations.catalogEntryEditValidation,
          validatorMiddleware.validate,
          catalog.editCatalogEntry
        );
      }
    });

    await cleanupCatalogs();
  });

  afterAll(async () => {
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

  it('crea, consulta y edita un catálogo administrable mediante el flujo compartido', async () => {
    const created = await request(app)
      .post('/managed/unit-measures')
      .send({ name: names.managedUnit, symbol: names.unitSymbol, unexpected: 'discarded' })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(created.body).toMatchObject({
      code: 'CREATED_CATALOG_ENTRY',
      data: { name: names.managedUnit, symbol: names.unitSymbol }
    });

    const listed = await request(app)
      .get('/managed/unit-measures')
      .query({ 'search[value]': names.managedUnit })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(listed.body).toMatchObject({
      recordsTotal: expect.any(Number),
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: created.body.data.id, name: names.managedUnit })]
    });

    const updatedName = `${ names.managedUnit } v2`;
    await request(app)
      .put(`/managed/unit-measures/${ created.body.data.id }`)
      .send({ name: updatedName, symbol: names.unitSymbol })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(response => {
        expect(response.body).toMatchObject({
          code: 'UPDATED_CATALOG_ENTRY',
          data: { id: created.body.data.id, name: updatedName }
        });
      });

    await expect(prisma.unitMeasure.findUnique({
      where: { id: created.body.data.id }
    })).resolves.toMatchObject({ name: updatedName, symbol: names.unitSymbol });
  });

  it('rechaza el payload antes de persistir cuando excede el límite del catálogo', async () => {
    await request(app)
      .post('/managed/unit-measures')
      .send({ name: 'x'.repeat(21), symbol: names.unitSymbol })
      .expect('Content-Type', /json/)
      .expect(400)
      .expect(response => {
        expect(response.body).toMatchObject({
          code: 'VALIDATION_ERROR',
          errors: {
            name: { code: 'NAME_TOO_LONG', meta: { value: 20 } }
          }
        });
      });

    await expect(prisma.unitMeasure.count({
      where: { name: 'x'.repeat(21) }
    })).resolves.toBe(0);
  });
});
