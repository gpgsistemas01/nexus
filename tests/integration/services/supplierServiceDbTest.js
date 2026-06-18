import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const testSuffix = Math.random().toString(36).slice(2, 8);
const tradeName = `Proveedor integración ${testSuffix}`;
const updatedTradeName = `${tradeName} actualizado`;
const legalName = `Legal ${testSuffix}`;

let prisma;
let services;

const cleanupSupplier = async () => {
  await prisma.supplier.deleteMany({
    where: {
      OR: [
        { tradeName },
        { tradeName: updatedTradeName },
        { legalName }
      ]
    }
  });
};

describeDb('supplierService database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/services/warehouse/supplierService.js')
    ]);

    await prisma.referenceNumberCounter.upsert({
      where: {
        prefix_year: {
          prefix: 'PRO',
          year: 0
        }
      },
      update: {},
      create: {
        prefix: 'PRO',
        year: 0,
        counter: 0
      }
    });
    await cleanupSupplier();
  });


  it('guarda, consulta y actualiza proveedores directamente en la base de pruebas', async () => {
    const createdSupplier = await services.createSupplier({
      tradeName,
      legalName,
      isActive: true
    });

    expect(createdSupplier).toMatchObject({ tradeName, legalName });
    expect(createdSupplier.code).toBeTruthy();

    await expect(services.findUniqueSupplier({ id: createdSupplier.id })).resolves.toEqual({
      id: createdSupplier.id,
      tradeName
    });
    await expect(services.findUniqueSupplierCode({ id: createdSupplier.id })).resolves.toEqual({
      code: createdSupplier.code
    });
    await expect(services.findAllSuppliers({ search: tradeName })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: createdSupplier.id, tradeName, legalName })]
    });

    await expect(services.updateSupplier({
      tradeName: updatedTradeName,
      legalName,
      isActive: true
    }, createdSupplier.id)).resolves.toMatchObject({
      id: createdSupplier.id,
      tradeName: updatedTradeName,
      legalName
    });

    await expect(prisma.supplier.findUnique({
      where: { id: createdSupplier.id },
      select: { tradeName: true, legalName: true }
    })).resolves.toEqual({
      tradeName: updatedTradeName,
      legalName
    });
  });
});
