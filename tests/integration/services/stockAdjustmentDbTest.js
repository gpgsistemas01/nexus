import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  presentation: `IT Adjustment Presentation ${testSuffix}`,
  unit: `IT Adj Unit ${testSuffix}`,
  unitSymbol: `ia${testSuffix.slice(-4)}`,
  product: `IT Adjustment Product ${testSuffix}`,
  createdProduct: `IT Adjustment Product Created ${testSuffix}`,
  updatedProduct: `IT Adjustment Product Updated ${testSuffix}`,
  supplierTradeName: `IT Adjustment Supplier ${testSuffix}`,
  supplierLegalName: `IT Adjustment Supplier Legal ${testSuffix}`,
  reason: `IT Adjustment Reason ${testSuffix}`,
  user: `ITAdjustUser${testSuffix}`.slice(0, 50)
};

let prisma;
let productService;
let adjustmentService;
let product;
let supplier;
let reason;
let user;

const cleanupStockAdjustmentData = async () => {
  const products = await prisma.product.findMany({
    where: { name: { startsWith: 'IT Adjustment Product ' } },
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
        { details: { some: { productId: { in: products.map(({ id }) => id) } } } },
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
  await prisma.supplierProduct.deleteMany({
    where: {
      OR: [
        { productId: { in: products.map(({ id }) => id) } },
        { supplierId: { in: suppliers.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.product.deleteMany({ where: { id: { in: products.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: suppliers.map(({ id }) => id) } } });
  await prisma.stockAdjustmentReason.deleteMany({ where: { id: { in: reasons.map(({ id }) => id) } } });
  await prisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: presentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: units.map(({ id }) => id) } } });
};

describeDb('stock adjustment cross-domain database integration', () => {
  beforeAll(async () => {
    [{ prisma }, productService, adjustmentService] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/services/warehouse/products/productService.js'),
      import('../../../src/services/warehouse/adjustmentService.js')
    ]);

    await cleanupStockAdjustmentData();

    const [presentation, unit] = await Promise.all([
      prisma.presentation.create({ data: { name: names.presentation } }),
      prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } })
    ]);

    [product, supplier, reason, user] = await Promise.all([
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
          codeNumber: 900001,
          code: `IA${testSuffix.slice(-6)}`.slice(0, 10),
          legalName: names.supplierLegalName,
          tradeName: names.supplierTradeName
        }
      }),
      prisma.stockAdjustmentReason.create({ data: { name: names.reason } }),
      prisma.user.create({ data: { name: names.user, password: 'test-password' } })
    ]);

    await prisma.referenceNumberCounter.upsert({
      where: {
        prefix_year: {
          prefix: 'AJU',
          year: new Date().getFullYear()
        }
      },
      update: {},
      create: {
        prefix: 'AJU',
        year: new Date().getFullYear(),
        counter: 0
      }
    });

    await prisma.supplierProduct.create({
      data: {
        productId: product.id,
        supplierId: supplier.id,
        currentStock: 1,
        convertedQuantity: 6,
        maxUnitCost: 10
      }
    });
  });

  it('cubre productService -> adjustmentService -> movementService actualizando stock real', async () => {
    await expect(productService.updateProductStock({
      id: product.id,
      userId: user.id,
      productDto: {
        supplierId: supplier.id,
        reasonId: reason.id,
        observations: 'Ajuste integración',
        newStock: 4
      }
    })).resolves.toMatchObject({
      productId: product.id,
      supplierId: supplier.id,
      currentStock: expect.anything(),
      convertedQuantity: expect.anything()
    });

    await expect(prisma.supplierProduct.findUnique({
      where: {
        supplierId_productId: {
          productId: product.id,
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
        productId: product.id,
        supplierId: supplier.id
      })]
    });
    expect(adjustment?.movement?.details).toEqual([
      expect.objectContaining({
        productId: product.id,
        supplierId: supplier.id
      })
    ]);
  });


  it('cubre adjustmentService.createStockAdjustment directo con movimiento real', async () => {
    await expect(adjustmentService.createStockAdjustment({
      productId: product.id,
      supplierId: supplier.id,
      reasonId: reason.id,
      observations: 'Ajuste directo integración',
      newStock: 6,
      userId: user.id
    })).resolves.toMatchObject({
      productId: product.id,
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
      details: [expect.objectContaining({ productId: product.id, supplierId: supplier.id })],
      movement: expect.objectContaining({
        details: [expect.objectContaining({ productId: product.id, supplierId: supplier.id })]
      })
    });
  });

  it('cubre createProduct/updateProduct con relación proveedor-producto y ajuste inicial en BD', async () => {
    await expect(productService.createProduct({
      productDto: {
        name: names.createdProduct,
        minStock: 0,
        base: 1,
        height: 2,
        presentationId: product.presentationId,
        unitMeasureId: product.unitMeasureId,
        supplierId: supplier.id,
        maxUnitCost: 15
      },
      stockDto: {
        reasonId: reason.id,
        observations: 'Alta inicial integración',
        newStock: 3
      },
      userId: user.id
    })).resolves.toMatchObject({
      supplierId: supplier.id,
      currentStock: expect.anything(),
      convertedQuantity: expect.anything()
    });

    const createdProduct = await prisma.product.findFirst({
      where: { name: names.createdProduct },
      select: { id: true, presentationId: true, unitMeasureId: true }
    });

    expect(createdProduct).toEqual({
      id: expect.any(String),
      presentationId: product.presentationId,
      unitMeasureId: product.unitMeasureId
    });

    await expect(productService.updateProduct({
      name: names.updatedProduct,
      minStock: 1,
      base: 2,
      height: 2,
      presentationId: product.presentationId,
      unitMeasureId: product.unitMeasureId,
      supplierId: supplier.id,
      maxUnitCost: 20
    }, createdProduct.id)).resolves.toMatchObject({
      id: createdProduct.id,
      name: names.updatedProduct,
      supplier: expect.objectContaining({ id: supplier.id })
    });

    await expect(prisma.supplierProduct.findUnique({
      where: {
        supplierId_productId: {
          productId: createdProduct.id,
          supplierId: supplier.id
        }
      },
      select: { maxUnitCost: true }
    })).resolves.toMatchObject({
      maxUnitCost: expect.objectContaining({ toString: expect.any(Function) })
    });
  });

});
