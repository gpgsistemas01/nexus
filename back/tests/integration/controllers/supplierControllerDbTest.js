import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const testSuffix = Math.random().toString(36).slice(2, 8);
const tradeName = `Proveedor integración ${testSuffix}`;
const updatedTradeName = `${tradeName} actualizado`;
const legalName = `Legal ${testSuffix}`;

let prisma;
let controllers;
let app;

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

describe('supplierController database integration', () => {
  beforeAll(async () => {
    [{ prisma }, controllers] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/controllers/api/warehouse/supplierController.js')
    ]);

    app = createControllerTestApp({
      registerRoutes: (router) => {
        router.get('/suppliers', controllers.getAllSuppliers);
        router.post('/suppliers', controllers.registerSupplier);
        router.put('/suppliers/:id', controllers.editSupplier);
      }
    });

    await prisma.referenceNumberCounter.createMany({
      data: [{
        prefix: 'PRO',
        year: 0,
        counter: 0
      }],
      skipDuplicates: true
    });
    await cleanupSupplier();
  });


  it('guarda, consulta y actualiza proveedores desde el controller', async () => {
    const registerResponse = await request(app)
      .post('/suppliers')
      .send({ tradeName, legalName, isActive: true })
      .expect(200);
    const createdSupplier = registerResponse.body.supplier;

    expect(createdSupplier).toMatchObject({ tradeName, legalName, code: expect.any(String) });

    const listResponse = await request(app)
      .get('/suppliers')
      .query({ 'search[value]': tradeName })
      .expect(200);

    expect(listResponse.body).toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: createdSupplier.id, tradeName, legalName })]
    });

    const editResponse = await request(app)
      .put(`/suppliers/${createdSupplier.id}`)
      .send({ tradeName: updatedTradeName, legalName, isActive: true })
      .expect(200);

    expect(editResponse.body.supplier).toMatchObject({
      id: createdSupplier.id,
      tradeName: updatedTradeName,
      legalName
    });

    await expect(prisma.supplier.findUnique({
      where: { id: createdSupplier.id },
      select: { tradeName: true, legalName: true }
    })).resolves.toEqual({ tradeName: updatedTradeName, legalName });
  });
});
