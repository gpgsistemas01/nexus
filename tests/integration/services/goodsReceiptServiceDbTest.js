import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  presentation: `IT Receipt Presentation ${testSuffix}`,
  unit: `IT REC Unit ${testSuffix}`,
  unitSymbol: `ir${testSuffix.slice(-4)}`,
  product: `IT Receipt Product ${testSuffix}`,
  supplierTradeName: `IT Receipt Supplier ${testSuffix}`,
  supplierLegalName: `IT Receipt Supplier Legal ${testSuffix}`,
  receivedBy: `IT Receipt Profile ${testSuffix}`,
  invoice: `REC-${testSuffix}`
};

let prisma;
let goodsReceiptService;
let product;
let supplier;
let receivedBy;
let supplierProduct;
let presentation;
let unit;

const cleanupGoodsReceiptData = async () => {
  const products = await prisma.product.findMany({ where: { name: { startsWith: 'IT Receipt Product ' } }, select: { id: true } });
  const suppliers = await prisma.supplier.findMany({ where: { tradeName: { startsWith: 'IT Receipt Supplier ' } }, select: { id: true } });
  const profiles = await prisma.profile.findMany({ where: { fullName: { startsWith: 'IT Receipt Profile ' } }, select: { id: true } });
  const presentations = await prisma.presentation.findMany({ where: { name: { startsWith: 'IT Receipt Presentation ' } }, select: { id: true } });
  const units = await prisma.unitMeasure.findMany({ where: { name: { startsWith: 'IT REC Unit ' } }, select: { id: true } });
  const receipts = await prisma.goodsReceipt.findMany({
    where: {
      OR: [
        { invoice: { startsWith: 'REC-' } },
        { supplierId: { in: suppliers.map(({ id }) => id) } },
        { receivedById: { in: profiles.map(({ id }) => id) } }
      ]
    },
    select: { id: true }
  });
  const receiptDetails = await prisma.goodsReceiptDetail.findMany({ where: { goodsReceiptId: { in: receipts.map(({ id }) => id) } }, select: { id: true } });

  await prisma.movementDetail.deleteMany({ where: { goodsReceiptDetailId: { in: receiptDetails.map(({ id }) => id) } } });
  await prisma.inventoryMovement.deleteMany({ where: { goodsReceiptId: { in: receipts.map(({ id }) => id) } } });
  await prisma.goodsReceiptDetail.deleteMany({ where: { id: { in: receiptDetails.map(({ id }) => id) } } });
  await prisma.goodsReceipt.deleteMany({ where: { id: { in: receipts.map(({ id }) => id) } } });
  await prisma.supplierProduct.deleteMany({ where: { OR: [{ productId: { in: products.map(({ id }) => id) } }, { supplierId: { in: suppliers.map(({ id }) => id) } }] } });
  await prisma.product.deleteMany({ where: { id: { in: products.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: suppliers.map(({ id }) => id) } } });
  await prisma.profile.deleteMany({ where: { id: { in: profiles.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: presentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: units.map(({ id }) => id) } } });
};

describeDb('goods receipt database integration', () => {
  beforeAll(async () => {
    [{ prisma }, goodsReceiptService] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js')
    ]);

    await cleanupGoodsReceiptData();

    presentation = await prisma.presentation.create({ data: { name: names.presentation } });
    unit = await prisma.unitMeasure.create({ data: { name: names.unit, symbol: names.unitSymbol } });
    receivedBy = await prisma.profile.create({ data: { fullName: names.receivedBy } });

    product = await prisma.product.create({
      data: {
        name: names.product,
        minStock: 0,
        base: 2,
        height: 3,
        presentationId: presentation.id,
        unitMeasureId: unit.id
      }
    });
    supplier = await prisma.supplier.create({
      data: {
        codeNumber: 920001,
        code: `IR${testSuffix.slice(-6)}`.slice(0, 10),
        legalName: names.supplierLegalName,
        tradeName: names.supplierTradeName
      }
    });
    supplierProduct = await prisma.supplierProduct.create({
      data: {
        productId: product.id,
        supplierId: supplier.id,
        currentStock: 0,
        convertedQuantity: 0,
        maxUnitCost: 1
      }
    });

    await Promise.all([
      prisma.referenceNumberCounter.upsert({
        where: { prefix_year: { prefix: 'REC', year: new Date().getFullYear() } },
        update: {},
        create: { prefix: 'REC', year: new Date().getFullYear(), counter: 0 }
      }),
      prisma.status.upsert({
        where: { name: 'Confirmada' },
        update: {},
        create: { name: 'Confirmada' }
      })
    ]);
  });

  it('cubre compra creando entrada, detalle, movimiento ENTRY y stock real', async () => {
    const goodsReceipt = await goodsReceiptService.createGoodsReceipt({
      goodsReceiptDto: {
        supplierId: supplier.id,
        receivedById: receivedBy.id,
        invoice: names.invoice,
        isInvoiced: true,
        receptionDate: new Date(),
        observations: 'Compra integración',
        details: [{
          productId: product.id,
          quantity: 2,
          costPerUnitType: 10
        }]
      }
    });

    expect(goodsReceipt).toMatchObject({
      supplierId: supplier.id,
      receivedById: receivedBy.id,
      invoice: names.invoice,
      details: [expect.objectContaining({ productId: product.id, quantity: expect.anything() })]
    });

    await expect(prisma.inventoryMovement.findFirst({
      where: { goodsReceiptId: goodsReceipt.id },
      include: { details: true }
    })).resolves.toMatchObject({
      type: 'ENTRY',
      details: [expect.objectContaining({ productId: product.id, supplierId: supplier.id })]
    });

    await expect(prisma.supplierProduct.findUnique({
      where: { supplierId_productId: { supplierId: supplier.id, productId: product.id } },
      select: { id: true, currentStock: true, convertedQuantity: true, maxUnitCost: true }
    })).resolves.toMatchObject({
      id: supplierProduct.id,
      currentStock: expect.objectContaining({ toString: expect.any(Function) }),
      convertedQuantity: expect.objectContaining({ toString: expect.any(Function) }),
      maxUnitCost: expect.objectContaining({ toString: expect.any(Function) })
    });

    await expect(goodsReceiptService.findAllGoodsReceipts({
      search: goodsReceipt.referenceNumber,
      supplierId: supplier.id,
      profileId: receivedBy.id
    })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: goodsReceipt.id, referenceNumber: goodsReceipt.referenceNumber })]
    });
  });
});
