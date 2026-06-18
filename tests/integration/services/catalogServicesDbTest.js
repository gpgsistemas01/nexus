import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

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
let services;

const cleanupCatalogs = async () => {
  await prisma.stockAdjustmentReason.deleteMany({ where: { name: { startsWith: 'IT Reason ' } } });
  await prisma.fulfillmentStatus.deleteMany({ where: { name: { startsWith: 'IT Status ' } } });
  await prisma.unitMeasure.deleteMany({ where: { name: { startsWith: 'IT Unit ' } } });
  await prisma.presentation.deleteMany({ where: { name: { startsWith: 'IT Presentation ' } } });
  await prisma.role.deleteMany({ where: { name: { startsWith: 'IT Role ' } } });
  await prisma.department.deleteMany({ where: { name: { startsWith: 'IT Department ' } } });
};

describeDb('catalog services database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      Promise.all([
        import('../../../src/services/admin/departmentService.js'),
        import('../../../src/services/admin/roleService.js'),
        import('../../../src/services/warehouse/presentationService.js'),
        import('../../../src/services/warehouse/unitMeasureService.js'),
        import('../../../src/services/warehouse/fulfillmentStatusService.js'),
        import('../../../src/services/warehouse/reasonService.js')
      ]).then(([
        departmentService,
        roleService,
        presentationService,
        unitMeasureService,
        fulfillmentStatusService,
        reasonService
      ]) => ({
        ...departmentService,
        ...roleService,
        ...presentationService,
        ...unitMeasureService,
        ...fulfillmentStatusService,
        ...reasonService
      }))
    ]);

    await cleanupCatalogs();
  });


  it('guarda catálogos en DATABASE_TEST_URL y los lee con servicios GET', async () => {
    const [department, presentation, unit] = await Promise.all([
      prisma.department.create({ data: { name: names.department } }),
      prisma.presentation.create({ data: { name: names.presentation } }),
      prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } }),
      prisma.role.create({ data: { name: names.role } }),
      prisma.fulfillmentStatus.create({ data: { name: names.status } }),
      prisma.stockAdjustmentReason.create({ data: { name: names.reason } })
    ]);

    await expect(services.findAllDepartments({ search: names.department })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: department.id, name: names.department })]
    });
    await expect(services.findDepartmentById({ id: department.id })).resolves.toEqual({
      id: department.id,
      name: names.department
    });

    await expect(services.findAllRoles({ search: names.role })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ name: names.role })]
    });

    await expect(services.findAllPresentations({ search: names.presentation })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: presentation.id, name: names.presentation })]
    });
    await expect(services.findUniquePresentation({ id: presentation.id })).resolves.toEqual({ id: presentation.id });

    await expect(services.findAllUnitMeasures({ search: names.unit })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: unit.id, name: names.unit, symbol: names.unitSymbol })]
    });
    await expect(services.findUniqueUnitMeasure({ id: unit.id })).resolves.toEqual({ id: unit.id });

    await expect(services.findAllFulfillmentStatuses({ search: names.status })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ name: names.status })]
    });

    await expect(services.findAllReasons({ search: names.reason })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ name: names.reason })]
    });
  });
});
