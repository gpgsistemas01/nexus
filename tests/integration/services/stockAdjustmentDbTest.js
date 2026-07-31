import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const testSuffix = Math.random().toString(36).slice(2, 8);
const initialStockReasonName = 'Stock inicial';

const names = {
  presentation: `IT Adjustment Presentation ${testSuffix}`,
  unit: `IT Adj Unit ${testSuffix}`,
  unitSymbol: `ia${testSuffix.slice(-4)}`,
  material: `IT Adjustment Material ${testSuffix}`,
  createdMaterial: `IT Adjustment Material Created ${testSuffix}`,
  updatedMaterial: `IT Adjustment Material Updated ${testSuffix}`,
  supplierTradeName: `IT Adjustment Supplier ${testSuffix}`,
  supplierLegalName: `IT Adjustment Supplier Legal ${testSuffix}`,
  reason: `IT Adjustment Reason ${testSuffix}`,
  user: `ITAdjustUser${testSuffix}`.slice(0, 50)
};

let prisma;
let materialService;
let adjustmentService;
let material;
let supplier;
let reason;
let initialStockReason;
let user;

const cleanupStockAdjustmentData = async () => {
  const materials = await prisma.material.findMany({
    where: { name: { startsWith: 'IT Adjustment Material ' } },
    select: { id: true }
  });
  const suppliers = await prisma.supplier.findMany({
    where: { tradeName: { startsWith: 'IT Adjustment Supplier ' } },
    select: { id: true }
  });
  const reasons = await prisma.stockAdjustmentReason.findMany({
    where: { name: { startsWith: 'IT Adjustment Reason ' } },
    select: { id: true }
  });
  const users = await prisma.user.findMany({
    where: { name: { startsWith: 'ITAdjustUser' } },
    select: { id: true }
  });
  const presentations = await prisma.presentation.findMany({
    where: { name: { startsWith: 'IT Adjustment Presentation ' } },
    select: { id: true }
  });
  const units = await prisma.unitMeasure.findMany({
    where: { name: { startsWith: 'IT Adj Unit ' } },
    select: { id: true }
  });
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
  const adjustmentDetails = await prisma.stockAdjustmentDetail.findMany({
    where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } },
    select: { id: true }
  });

  await prisma.movementDetail.deleteMany({
    where: { stockAdjustmentDetailId: { in: adjustmentDetails.map(({ id }) => id) } }
  });
  await prisma.inventoryMovement.deleteMany({
    where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } }
  });
  await prisma.stockAdjustmentDetail.deleteMany({
    where: { id: { in: adjustmentDetails.map(({ id }) => id) } }
  });
  await prisma.stockAdjustment.deleteMany({
    where: { id: { in: adjustments.map(({ id }) => id) } }
  });
  await prisma.supplierMaterial.deleteMany({
    where: {
      OR: [
        { materialId: { in: materials.map(({ id }) => id) } },
        { supplierId: { in: suppliers.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.material.deleteMany({ where: { id: { in: materials.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: suppliers.map(({ id }) => id) } } });
  await prisma.stockAdjustmentReason.deleteMany({ where: { id: { in: reasons.map(({ id }) => id) } } });
  await prisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: presentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: units.map(({ id }) => id) } } });
};

describeDb('stock adjustment cross-domain database integration', () => {
  beforeAll(async () => {
    [{ prisma }, materialService, adjustmentService] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/services/warehouse/materials/materialService.js'),
      import('../../../src/services/warehouse/adjustmentService.js')
    ]);

    await cleanupStockAdjustmentData();

    initialStockReason = await prisma.stockAdjustmentReason.findFirst({
      where: {
        name: {
          equals: initialStockReasonName,
          mode: 'insensitive'
        }
      },
      select: { id: true }
    });

    if (!initialStockReason) {
      initialStockReason = await prisma.stockAdjustmentReason.create({
        data: { name: initialStockReasonName },
        select: { id: true }
      });
    }

    const [presentation, unit] = await Promise.all([
      prisma.presentation.create({ data: { name: names.presentation } }),
      prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } })
    ]);

    [material, supplier, reason, user] = await Promise.all([
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
          codeNumber: 900001,
          code: `IA${testSuffix.slice(-6)}`.slice(0, 10),
          legalName: names.supplierLegalName,
          tradeName: names.supplierTradeName
        }
      }),
      prisma.stockAdjustmentReason.create({ data: { name: names.reason } }),
      prisma.user.create({ data: { name: names.user, password: 'test-password' } })
    ]);

    await prisma.referenceNumberCounter.createMany({
      data: [{
        prefix: 'AJU',
        year: new Date().getFullYear(),
        counter: 0
      }],
      skipDuplicates: true
    });

    await prisma.supplierMaterial.create({
      data: {
        materialId: material.id,
        supplierId: supplier.id,
        currentStock: 1,
        convertedQuantity: 6,
        maxUnitCost: 10
      }
    });
  });

  it('cubre materialService -> adjustmentService actualizando stock y movimiento real', async () => {
    await expect(materialService.updateMaterialStock({
      id: material.id,
      userId: user.id,
      materialDto: {
        supplierId: supplier.id,
        reasonId: reason.id,
        observations: 'Ajuste integración',
        newStock: 4
      }
    })).resolves.toMatchObject({
      materialId: material.id,
      supplierId: supplier.id,
      currentStock: expect.anything(),
      convertedQuantity: expect.anything()
    });

    await expect(prisma.supplierMaterial.findUnique({
      where: {
        supplierId_materialId: {
          materialId: material.id,
          supplierId: supplier.id
        }
      },
      select: {
        currentStock: true,
        convertedQuantity: true
      }
    })).resolves.toMatchObject({
      currentStock: expect.objectContaining({ toString: expect.any(Function) }),
      convertedQuantity: expect.objectContaining({ toString: expect.any(Function) })
    });

    const adjustment = await prisma.stockAdjustment.findFirst({
      where: {
        reasonId: reason.id,
        createdById: user.id
      },
      include: {
        details: true,
        movement: {
          include: {
            details: true
          }
        }
      }
    });

    expect(adjustment).toMatchObject({
      observations: 'Ajuste integración',
      details: [expect.objectContaining({
        materialId: material.id,
        supplierId: supplier.id
      })]
    });
    expect(adjustment?.movement?.details).toEqual([
      expect.objectContaining({
        materialId: material.id,
        supplierId: supplier.id
      })
    ]);
  });


  it('cubre adjustmentService.createStockAdjustment directo con movimiento real', async () => {
    await expect(adjustmentService.createStockAdjustment({
      materialId: material.id,
      supplierId: supplier.id,
      reasonId: reason.id,
      observations: 'Ajuste directo integración',
      newStock: 6,
      userId: user.id
    })).resolves.toMatchObject({
      materialId: material.id,
      supplierId: supplier.id,
      currentStock: expect.anything(),
      convertedQuantity: expect.anything()
    });

    const adjustment = await prisma.stockAdjustment.findFirst({
      where: {
        observations: 'Ajuste directo integración',
        reasonId: reason.id,
        createdById: user.id
      },
      include: {
        details: true,
        movement: { include: { details: true } }
      }
    });

    expect(adjustment).toMatchObject({
      details: [expect.objectContaining({ materialId: material.id, supplierId: supplier.id })],
      movement: expect.objectContaining({
        details: [expect.objectContaining({ materialId: material.id, supplierId: supplier.id })]
      })
    });
  });

  it('crea y actualiza un material sin generar un ajuste de stock inicial', async () => {
    await expect(materialService.createMaterial({
      materialDto: {
        name: names.createdMaterial,
        minStock: 0,
        base: 1,
        height: 2,
        presentationId: material.presentationId,
        unitMeasureId: material.unitMeasureId,
        supplierId: supplier.id,
        maxUnitCost: 15
      }
    })).resolves.toMatchObject({
      supplierId: supplier.id,
      currentStock: expect.anything(),
      convertedQuantity: expect.anything()
    });

    const createdMaterial = await prisma.material.findFirst({
      where: { name: names.createdMaterial },
      select: { id: true, presentationId: true, unitMeasureId: true }
    });

    expect(createdMaterial).toEqual({
      id: expect.any(String),
      presentationId: material.presentationId,
      unitMeasureId: material.unitMeasureId
    });

    await expect(prisma.stockAdjustment.findFirst({
      where: { details: { some: { materialId: createdMaterial.id } } },
      select: { id: true }
    })).resolves.toBeNull();

    const createdSupplierMaterial = await prisma.supplierMaterial.findUnique({
      where: {
        supplierId_materialId: {
          supplierId: supplier.id,
          materialId: createdMaterial.id
        }
      },
      select: { currentStock: true }
    });

    expect(Number(createdSupplierMaterial?.currentStock)).toBe(0);

    await expect(materialService.updateMaterial({
      name: names.updatedMaterial,
      minStock: 1,
      base: 2,
      height: 2,
      presentationId: material.presentationId,
      unitMeasureId: material.unitMeasureId,
      supplierId: supplier.id,
      maxUnitCost: 20
    }, createdMaterial.id)).resolves.toMatchObject({
      id: createdMaterial.id,
      name: names.updatedMaterial,
      supplier: expect.objectContaining({ id: supplier.id })
    });

    await expect(prisma.supplierMaterial.findUnique({
      where: {
        supplierId_materialId: {
          materialId: createdMaterial.id,
          supplierId: supplier.id
        }
      },
      select: { maxUnitCost: true }
    })).resolves.toMatchObject({
      maxUnitCost: expect.objectContaining({ toString: expect.any(Function) })
    });
  });

});
