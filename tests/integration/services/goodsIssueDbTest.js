import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;
const INITIAL_STOCK_REASON_NAME = 'Stock inicial';

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  presentation: `IT WasteIssue Presentation ${testSuffix}`,
  unit: `IT WI Unit ${testSuffix}`,
  unitSymbol: `iw${testSuffix.slice(-4)}`,
  material: `IT WasteIssue Material ${testSuffix}`,
  supplierTradeName: `IT WasteIssue Supplier ${testSuffix}`,
  supplierLegalName: `IT WasteIssue Supplier Legal ${testSuffix}`,
  reason: `IT WasteIssue Reason ${testSuffix}`,
  user: `ITWasteIssueUser${testSuffix}`.slice(0, 50),
  requester: `IT WasteIssue Requester ${testSuffix}`,
  advisor: `IT WasteIssue Advisor ${testSuffix}`,
  department: `IT WasteIssue Department ${testSuffix}`,
  client: `IT WasteIssue Client ${testSuffix}`,
  projectNumber: `IW${testSuffix.slice(-6)}`,
  updatedProjectNumber: `UW${testSuffix.slice(-6)}`
};

let prisma;
let services;
let material;
let supplier;
let reason;
let user;
let supplierMaterial;
let requester;
let advisor;
let department;
let client;
let presentation;
let unit;

const cleanupWasteIssueData = async () => {
  const materials = await prisma.material.findMany({ where: { name: { startsWith: 'IT WasteIssue Material ' } }, select: { id: true } });
  const suppliers = await prisma.supplier.findMany({ where: { tradeName: { startsWith: 'IT WasteIssue Supplier ' } }, select: { id: true } });
  const reasons = await prisma.stockAdjustmentReason.findMany({ where: { name: { startsWith: 'IT WasteIssue Reason ' } }, select: { id: true } });
  const users = await prisma.user.findMany({ where: { name: { startsWith: 'ITWasteIssueUser' } }, select: { id: true } });
  const persons = await prisma.person.findMany({ where: { fullName: { startsWith: 'IT WasteIssue ' } }, select: { id: true } });
  const departments = await prisma.department.findMany({ where: { name: { startsWith: 'IT WasteIssue Department ' } }, select: { id: true } });
  const clients = await prisma.client.findMany({ where: { name: { startsWith: 'IT WasteIssue Client ' } }, select: { id: true } });
  const presentations = await prisma.presentation.findMany({ where: { name: { startsWith: 'IT WasteIssue Presentation ' } }, select: { id: true } });
  const units = await prisma.unitMeasure.findMany({ where: { name: { startsWith: 'IT WI Unit ' } }, select: { id: true } });
  const adjustments = await prisma.stockAdjustment.findMany({
    where: {
      OR: [
        { reasonId: { in: reasons.map(({ id }) => id) } },
        { createdById: { in: users.map(({ id }) => id) } },
        { details: { some: { materialId: { in: materials.map(({ id }) => id) } } } },
        { details: { some: { supplierId: { in: suppliers.map(({ id }) => id) } } } }
      ]
    },
    select: { id: true }
  });
  const adjustmentDetails = await prisma.stockAdjustmentDetail.findMany({ where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } }, select: { id: true } });
  const goodsIssues = await prisma.goodsIssue.findMany({
    where: {
      OR: [
        { clientId: { in: clients.map(({ id }) => id) } },
        { requesterId: { in: persons.map(({ id }) => id) } },
        { departmentId: { in: departments.map(({ id }) => id) } },
        { projectNumber: { startsWith: 'IW' } }
      ]
    },
    select: { id: true }
  });

  await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssueId: { in: goodsIssues.map(({ id }) => id) } } });
  await prisma.goodsIssue.deleteMany({ where: { id: { in: goodsIssues.map(({ id }) => id) } } });
  const wasteAdjustmentDetails = await prisma.wasteStockAdjustmentDetail.findMany({
    where: { waste: { supplierMaterial: { materialId: { in: materials.map(({ id }) => id) } } } },
    select: { id: true, wasteStockAdjustmentId: true }
  });
  const wasteAdjustmentIds = [...new Set(wasteAdjustmentDetails.map(({ wasteStockAdjustmentId }) => wasteStockAdjustmentId))];
  const wasteAdjustments = await prisma.wasteStockAdjustment.findMany({
    where: { id: { in: wasteAdjustmentIds } },
    select: { wasteMovementId: true }
  });
  const wasteMovementIds = wasteAdjustments.map(({ wasteMovementId }) => wasteMovementId).filter(Boolean);

  await prisma.wasteMovementDetail.deleteMany({ where: { wasteStockAdjustmentDetailId: { in: wasteAdjustmentDetails.map(({ id }) => id) } } });
  await prisma.wasteMovement.deleteMany({ where: { id: { in: wasteMovementIds } } });
  await prisma.wasteStockAdjustment.deleteMany({ where: { id: { in: wasteAdjustmentIds } } });
  await prisma.waste.deleteMany({ where: { supplierMaterial: { materialId: { in: materials.map(({ id }) => id) } } } });
  await prisma.movementDetail.deleteMany({ where: { stockAdjustmentDetailId: { in: adjustmentDetails.map(({ id }) => id) } } });
  await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } } });
  await prisma.stockAdjustmentDetail.deleteMany({ where: { id: { in: adjustmentDetails.map(({ id }) => id) } } });
  await prisma.stockAdjustment.deleteMany({ where: { id: { in: adjustments.map(({ id }) => id) } } });
  await prisma.supplierMaterial.deleteMany({ where: { OR: [{ materialId: { in: materials.map(({ id }) => id) } }, { supplierId: { in: suppliers.map(({ id }) => id) } }] } });
  await prisma.material.deleteMany({ where: { id: { in: materials.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: suppliers.map(({ id }) => id) } } });
  await prisma.stockAdjustmentReason.deleteMany({ where: { id: { in: reasons.map(({ id }) => id) } } });
  await prisma.client.deleteMany({ where: { id: { in: clients.map(({ id }) => id) } } });
  await prisma.personRoleDepartment.deleteMany({ where: { OR: [{ personId: { in: persons.map(({ id }) => id) } }, { departmentId: { in: departments.map(({ id }) => id) } }] } });
  await prisma.person.deleteMany({ where: { id: { in: persons.map(({ id }) => id) } } });
  await prisma.department.deleteMany({ where: { id: { in: departments.map(({ id }) => id) } } });
  await prisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: presentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: units.map(({ id }) => id) } } });
};

describeDb('goods issue database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/services/warehouse/goodsIssues/goodsIssueService.js')
    ]);

    await cleanupWasteIssueData();

    [presentation, unit, reason, user, requester, advisor, department, client] = await Promise.all([
      prisma.presentation.create({ data: { name: names.presentation } }),
      prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } }),
      prisma.stockAdjustmentReason.create({ data: { name: names.reason } }),
      prisma.user.create({ data: { name: names.user, password: 'test-password' } }),
      prisma.person.create({ data: { fullName: names.requester } }),
      prisma.person.create({ data: { fullName: names.advisor } }),
      prisma.department.create({ data: { name: names.department } }),
      prisma.client.create({ data: { name: names.client } })
    ]);

    [material, supplier] = await Promise.all([
      prisma.material.create({
        data: {
          name: names.material,
          minStock: 0,
          base: 2,
          height: 3,
          presentationId: presentation.id,
          unitMeasureId: unit.id
        }
      }),
      prisma.supplier.create({
        data: {
          codeNumber: 910001,
          code: `IW${testSuffix.slice(-6)}`.slice(0, 10),
          legalName: names.supplierLegalName,
          tradeName: names.supplierTradeName
        }
      })
    ]);

    supplierMaterial = await prisma.supplierMaterial.create({
      data: {
        materialId: material.id,
        supplierId: supplier.id,
        currentStock: 10,
        convertedQuantity: 60,
        maxUnitCost: 12
      }
    });

    const year = new Date().getFullYear();
    await Promise.all([
      prisma.referenceNumberCounter.createMany({
        data: [
          { prefix: 'AJU', year, counter: 0 },
          { prefix: 'SAL', year, counter: 0 }
        ],
        skipDuplicates: true
      }),
      prisma.status.upsert({
        where: { name: 'Aprobada' },
        update: {},
        create: { name: 'Aprobada' }
      }),
      prisma.stockAdjustmentReason.createMany({
        data: [{ name: INITIAL_STOCK_REASON_NAME }],
        skipDuplicates: true
      }),
      prisma.fulfillmentStatus.upsert({
        where: { name: 'Pendiente' },
        update: {},
        create: { name: 'Pendiente' }
      }),
      prisma.fulfillmentStatus.upsert({
        where: { name: 'Surtido' },
        update: {},
        create: { name: 'Surtido' }
      })
    ]);
  });

  it('cubre salidas creando goods issue con detalle real', async () => {
    const goodsIssue = await services.createGoodsIssue({
      goodsIssueDto: {
        requesterId: requester.id,
        advisorId: advisor.id,
        clientId: client.id,
        departmentId: department.id,
        projectNumber: names.projectNumber,
        requestDate: new Date(),
        observations: 'Salida integración',
        details: [{
          materialId: material.id,
          supplierId: supplier.id,
          presentationId: presentation.id,
          quantity: 1
        }]
      }
    });

    expect(goodsIssue).toMatchObject({
      projectNumber: names.projectNumber,
      clientId: client.id,
      requesterId: requester.id,
      details: [expect.objectContaining({
        materialId: material.id,
        supplierId: supplier.id,
        quantity: expect.anything()
      })]
    });

    const updatedGoodsIssue = await services.updateGoodsIssue({
      id: goodsIssue.id,
      goodsIssueDto: {
        requesterId: requester.id,
        advisorId: advisor.id,
        clientId: client.id,
        departmentId: department.id,
        projectNumber: names.updatedProjectNumber,
        requestDate: goodsIssue.requestDate,
        observations: 'Salida integración actualizada',
        details: [{
          materialId: material.id,
          supplierId: supplier.id,
          presentationId: presentation.id,
          quantity: 2
        }]
      }
    });

    expect(updatedGoodsIssue).toMatchObject({
      id: goodsIssue.id,
      projectNumber: names.updatedProjectNumber,
      details: [expect.objectContaining({
        materialId: material.id,
        supplierId: supplier.id,
        quantity: expect.anything()
      })]
    });

    const suppliedGoodsIssue = await services.updateGoodsIssueDetails({
      id: goodsIssue.id,
      goodsIssueDto: {
        details: updatedGoodsIssue.details.map(detail => ({
          id: detail.id,
          isSupplied: true,
          projectConvertedQuantity: detail.convertedQuantity
        }))
      }
    });

    expect(suppliedGoodsIssue).toMatchObject({
      id: goodsIssue.id,
      fulfillmentStatus: expect.objectContaining({ name: 'Surtido' }),
      details: [expect.objectContaining({
        materialId: material.id,
        supplierId: supplier.id,
        isSupplied: true
      })]
    });

    await expect(prisma.inventoryMovement.findFirst({
      where: { goodsIssueId: goodsIssue.id },
      include: { details: true }
    })).resolves.toMatchObject({
      type: 'ISSUE',
      details: [expect.objectContaining({ materialId: material.id, supplierId: supplier.id })]
    });

    await expect(services.findAllGoodsIssues({
      search: goodsIssue.referenceNumber,
      accesses: [{ role: 'Administrador del sistema', department: names.department }]
    })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: goodsIssue.id, referenceNumber: goodsIssue.referenceNumber })]
    });
  });
});
