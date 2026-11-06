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
      .send({
        name: names.managedUnit,
        symbol: names.unitSymbol,
        isActive: true,
        unexpected: 'discarded'
      })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(created.body).toMatchObject({
      code: 'CREATED_CATALOG_ENTRY',
      data: { name: names.managedUnit, symbol: names.unitSymbol, isActive: true }
    });

    const listed = await request(app)
      .get('/managed/unit-measures')
      .query({ 'search[value]': names.managedUnit })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(listed.body).toMatchObject({
      recordsTotal: expect.any(Number),
      recordsFiltered: 1,
      data: [expect.objectContaining({
        id: created.body.data.id,
        name: names.managedUnit,
        isActive: true
      })]
    });

    const updatedName = `${ names.managedUnit } v2`;
    await request(app)
      .put(`/managed/unit-measures/${ created.body.data.id }`)
      .send({ name: updatedName, symbol: names.unitSymbol, isActive: false, expectedVersion: listed.body.data[0].version })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(response => {
        expect(response.body).toMatchObject({
          code: 'UPDATED_CATALOG_ENTRY',
          data: { id: created.body.data.id, name: updatedName, isActive: false }
        });
      });

    await expect(prisma.unitMeasure.findUnique({
      where: { id: created.body.data.id }
    })).resolves.toMatchObject({
      name: updatedName,
      symbol: names.unitSymbol,
      isActive: false
    });
  });

  it('acota páginas HTTP y conserva el resto de registros para la página siguiente (CP-INT-PAG-001)', async () => {
    const prefix = `IT Page ${testSuffix} `;
    const rows = Array.from({ length: 101 }, (_, index) => ({ name: `${prefix}${String(index).padStart(3, '0')}` }));
    try {
      await prisma.presentation.createMany({ data: rows });
      const before = await prisma.presentation.findMany({ where: { name: { startsWith: prefix } }, orderBy: { name: 'asc' } });
      const first = await request(app).get('/managed/presentations')
        .query({ start: 0, length: 1000000, search: prefix }).expect(200);
      expect(first.body.recordsFiltered).toBe(101);
      expect(first.body.data.map(row => row.name)).toEqual(rows.slice(0, 100).map(row => row.name));
      const next = await request(app).get('/managed/presentations')
        .query({ start: 100, length: 1000000, search: prefix }).expect(200);
      expect(next.body.data.map(row => row.name)).toEqual([rows[100].name]);
      const countsOnly = await request(app).get('/managed/presentations')
        .query({ length: 0, search: prefix }).expect(200);
      expect(countsOnly.body).toMatchObject({ data: [], recordsFiltered: 101 });
      const after = await prisma.presentation.findMany({ where: { name: { startsWith: prefix } }, orderBy: { name: 'asc' } });
      expect(after).toEqual(before);
    } finally {
      await prisma.presentation.deleteMany({ where: { name: { startsWith: prefix } } });
    }
  });

  it('normaliza texto plano y descarta campos ajenos en alta y edición (CP-INT-VAL-006)', async () => {
    const name = `IT Presentation O'Brien & ${testSuffix}`;
    const created = await request(app).post('/managed/presentations').send({
      name: `  ${name}  `, isActive: 'true', id: 'caller-id', version: 999,
      key: 'caller-key', roleId: 'caller-role', unexpected: { nested: true }
    }).expect(201);
    const id = created.body.data.id;
    const before = await prisma.presentation.findUniqueOrThrow({ where: { id } });
    expect(before).toMatchObject({ name, isActive: true, version: 0 });
    expect(id).not.toBe('caller-id');
    expect(before.name).not.toContain('&#');

    await request(app).put(`/managed/presentations/${id}`).send({
      name: ` ${name} v2 `, isActive: 'false', expectedVersion: before.version,
      id: 'replacement-id', version: 999, key: 'changed-key'
    }).expect(200);
    const after = await prisma.presentation.findUniqueOrThrow({ where: { id } });
    expect(after).toMatchObject({ id, name: `${name} v2`, isActive: false, version: 1 });

    const searched = await request(app).get('/managed/presentations')
      .query({ search: "' OR 1=1 --" }).expect(200);
    expect(searched.body).toMatchObject({ data: [], recordsFiltered: 0 });
    expect(await prisma.presentation.findUniqueOrThrow({ where: { id } })).toEqual(after);
  });

  it.each(['__proto__', 'constructor', 'toString'])('rechaza catálogo heredado %s sin acceder a otro modelo (CP-INT-VAL-006)', async catalog => {
    const before = await prisma.presentation.findMany({ orderBy: { id: 'asc' } });
    await request(app).post(`/managed/${catalog}`).send({ name: 'No permitido', isActive: true })
      .expect(404).expect(response => expect(response.body.code).toBe('CATALOG_NOT_FOUND'));
    expect(await prisma.presentation.findMany({ orderBy: { id: 'asc' } })).toEqual(before);
  });

  it('conserva el límite de caracteres Unicode sin medir unidades UTF-16 (CP-INT-VAL-006)', async () => {
    const name = '🙂'.repeat(50);
    let id;
    try {
      const response = await request(app).post('/managed/presentations').send({ name, isActive: true }).expect(201);
      id = response.body.data.id;
      expect(await prisma.presentation.findUniqueOrThrow({ where: { id } })).toMatchObject({ name });
    } finally {
      if (id) await prisma.presentation.delete({ where: { id } });
    }
  });

  it.each([
    ['<script>alert(1)</script>', 'NAME_INVALID_FORMAT'],
    ['Texto\u0000oculto', 'NAME_INVALID_FORMAT'],
    [{ name: 'Objeto inesperado' }, 'NAME_INVALID_TYPE']
  ])('rechaza nombre %j sin persistir en alta ni edición (CP-INT-VAL-006)', async (name, code) => {
    const entry = await prisma.presentation.create({ data: { name: `${names.presentation} security` } });
    try {
      const before = await prisma.presentation.findMany({ orderBy: { id: 'asc' } });
      for (const method of ['post', 'put']) {
        const path = `/managed/presentations${method === 'put' ? `/${entry.id}` : ''}`;
        const response = await request(app)[method](path).send({
          name, isActive: true, expectedVersion: entry.version
        }).expect(400);
        expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { name: { code } } });
        expect(await prisma.presentation.findMany({ orderBy: { id: 'asc' } })).toEqual(before);
      }
    } finally {
      await prisma.presentation.delete({ where: { id: entry.id } });
    }
  });

  it('rechaza el payload antes de persistir cuando excede el límite del catálogo', async () => {
    await request(app)
      .post('/managed/unit-measures')
      .send({ name: 'x'.repeat(21), symbol: names.unitSymbol, isActive: true })
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
