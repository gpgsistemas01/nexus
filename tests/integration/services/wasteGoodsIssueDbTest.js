import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  presentation: `IT WasteIssue Presentation ${testSuffix}`,
  unit: `IT WI Unit ${testSuffix}`,
  unitSymbol: `iw${testSuffix.slice(-4)}`,
  product: `IT WasteIssue Product ${testSuffix}`,
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
let product;
let supplier;
let reason;
let user;
let supplierProduct;
let requester;
let advisor;
let department;
let client;
let presentation;
let unit;

const cleanupWasteIssueData = async () => {
  const products = await prisma.product.findMany({ where: { name: { startsWith: 'IT WasteIssue Product ' } }, select: { id: true } });
  const suppliers = await prisma.supplier.findMany({ where: { tradeName: { startsWith: 'IT WasteIssue Supplier ' } }, select: { id: true } });
  const reasons = await prisma.stockAdjustmentReason.findMany({ where: { name: { startsWith: 'IT WasteIssue Reason ' } }, select: { id: true } });
  const users = await prisma.user.findMany({ where: { name: { startsWith: 'ITWasteIssueUser' } }, select: { id: true } });
  const profiles = await prisma.profile.findMany({ where: { fullName: { startsWith: 'IT WasteIssue ' } }, select: { id: true } });
  const departments = await prisma.department.findMany({ where: { name: { startsWith: 'IT WasteIssue Department ' } }, select: { id: true } });
  const clients = await prisma.client.findMany({ where: { name: { startsWith: 'IT WasteIssue Client ' } }, select: { id: true } });
  const presentations = await prisma.presentation.findMany({ where: { name: { startsWith: 'IT WasteIssue Presentation ' } }, select: { id: true } });
  const units = await prisma.unitMeasure.findMany({ where: { name: { startsWith: 'IT WI Unit ' } }, select: { id: true } });
  const adjustments = await prisma.stockAdjustment.findMany({
    where: {
      OR: [
        { reasonId: { in: reasons.map(({ id }) => id) } },
        { createdById: { in: users.map(({ id }) => id) } },
        { details: { some: { productId: { in: products.map(({ id }) => id) } } } },
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
        { requesterId: { in: profiles.map(({ id }) => id) } },
        { departmentId: { in: departments.map(({ id }) => id) } },
        { projectNumber: { startsWith: 'IW' } }
      ]
    },
    select: { id: true }
  });

  await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssueId: { in: goodsIssues.map(({ id }) => id) } } });
  await prisma.goodsIssue.deleteMany({ where: { id: { in: goodsIssues.map(({ id }) => id) } } });
  await prisma.waste.deleteMany({ where: { supplierProduct: { productId: { in: products.map(({ id }) => id) } } } });
  await prisma.movementDetail.deleteMany({ where: { stockAdjustmentDetailId: { in: adjustmentDetails.map(({ id }) => id) } } });
  await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } } });
  await prisma.stockAdjustmentDetail.deleteMany({ where: { id: { in: adjustmentDetails.map(({ id }) => id) } } });
  await prisma.stockAdjustment.deleteMany({ where: { id: { in: adjustments.map(({ id }) => id) } } });
  await prisma.supplierProduct.deleteMany({ where: { OR: [{ productId: { in: products.map(({ id }) => id) } }, { supplierId: { in: suppliers.map(({ id }) => id) } }] } });
  await prisma.product.deleteMany({ where: { id: { in: products.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: suppliers.map(({ id }) => id) } } });
  await prisma.stockAdjustmentReason.deleteMany({ where: { id: { in: reasons.map(({ id }) => id) } } });
  await prisma.client.deleteMany({ where: { id: { in: clients.map(({ id }) => id) } } });
  await prisma.departmentProfile.deleteMany({ where: { OR: [{ profileId: { in: profiles.map(({ id }) => id) } }, { departmentId: { in: departments.map(({ id }) => id) } }] } });
  await prisma.profile.deleteMany({ where: { id: { in: profiles.map(({ id }) => id) } } });
  await prisma.department.deleteMany({ where: { id: { in: departments.map(({ id }) => id) } } });
  await prisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: presentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: units.map(({ id }) => id) } } });
};

describeDb('waste and goods issue database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      Promise.all([
        import('../../../src/services/warehouse/wasteService.js'),
        import('../../../src/services/warehouse/goodsIssues/goodsIssueService.js')
      ]).then(([wasteService, goodsIssueService]) => ({ ...wasteService, ...goodsIssueService }))
    ]);

    await cleanupWasteIssueData();

    [presentation, unit, reason, user, requester, advisor, department, client] = await Promise.all([
      prisma.presentation.create({ data: { name: names.presentation } }),
      prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } }),
      prisma.stockAdjustmentReason.create({ data: { name: names.reason } }),
      prisma.user.create({ data: { name: names.user, password: 'test-password' } }),
      prisma.profile.create({ data: { fullName: names.requester } }),
      prisma.profile.create({ data: { fullName: names.advisor } }),
      prisma.department.create({ data: { name: names.department } }),
      prisma.client.create({ data: { name: names.client } })
    ]);

    [product, supplier] = await Promise.all([
      prisma.product.create({
        data: {
          name: names.product,
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

    supplierProduct = await prisma.supplierProduct.create({
      data: {
        productId: product.id,
        supplierId: supplier.id,
        currentStock: 10,
        convertedQuantity: 60,
        maxUnitCost: 12
      }
    });

    const year = new Date().getFullYear();
    await Promise.all([
      prisma.referenceNumberCounter.upsert({
        where: { prefix_year: { prefix: 'AJU', year } },
        update: {},
        create: { prefix: 'AJU', year, counter: 0 }
      }),
      prisma.referenceNumberCounter.upsert({
        where: { prefix_year: { prefix: 'SAL', year } },
        update: {},
        create: { prefix: 'SAL', year, counter: 0 }
      }),
      prisma.status.upsert({
        where: { name: 'Aprobada' },
        update: {},
        create: { name: 'Aprobada' }
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

  it('cubre merma creando waste y ajuste de stock real', async () => {
    const waste = await services.createWasteAdjustment({
      userId: user.id,
      wasteDto: {
        supplierProductId: supplierProduct.id,
        base: 1,
        height: 1,
        currentStock: 2,
        reasonId: reason.id,
        observations: 'Merma integración'
      }
    });

    expect(waste).toMatchObject({
      supplierProductId: supplierProduct.id,
      name: names.product,
      supplier: expect.objectContaining({ id: supplier.id })
    });

    await expect(services.updateWaste({
      id: waste.id,
      wasteDto: {
        supplierProductId: supplierProduct.id,
        base: 1,
        height: 2
      }
    })).resolves.toMatchObject({
      id: waste.id,
      supplierProductId: supplierProduct.id
    });

    await expect(services.updateWasteStock({
      id: waste.id,
      userId: user.id,
      wasteStockDto: {
        currentStock: 3,
        reasonId: reason.id,
        observations: 'Merma integración update'
      }
    })).resolves.toMatchObject({
      id: waste.id,
      currentStock: expect.anything()
    });

    await expect(prisma.waste.findUnique({ where: { id: waste.id }, select: { id: true } })).resolves.toEqual({ id: waste.id });
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
          productId: product.id,
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
        productId: product.id,
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
          productId: product.id,
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
        productId: product.id,
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
        productId: product.id,
        supplierId: supplier.id,
        isSupplied: true
      })]
    });

    await expect(prisma.inventoryMovement.findFirst({
      where: { goodsIssueId: goodsIssue.id },
      include: { details: true }
    })).resolves.toMatchObject({
      type: 'ISSUE',
      details: [expect.objectContaining({ productId: product.id, supplierId: supplier.id })]
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
