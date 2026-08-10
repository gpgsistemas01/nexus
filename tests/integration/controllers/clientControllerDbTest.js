import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';

const clientName = `Cliente integración ${Date.now()}-${Math.random().toString(36).slice(2)}`;
const updatedClientName = `${clientName} actualizado`;

let prisma;
let controllers;
let app;

const cleanupClient = async () => {
  await prisma.client.deleteMany({
    where: {
      name: {
        in: [clientName, updatedClientName]
      }
    }
  });
};

describe('clientController database integration', () => {
  beforeAll(async () => {
    [{ prisma }, controllers] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/controllers/api/sales/clientController.js')
    ]);

    app = createControllerTestApp({
      registerRoutes: (router) => {
        router.get('/clients', controllers.getAllClients);
        router.post('/clients', controllers.registerClient);
        router.put('/clients/:id', controllers.editClient);
      }
    });

    await cleanupClient();
  });


  it('guarda, lista y actualiza clientes desde el controller con todos sus servicios', async () => {
    const registerResponse = await request(app)
      .post('/clients')
      .send({ name: `  ${clientName}  ` })
      .expect('Content-Type', /json/)
      .expect(200);
    const createdClient = registerResponse.body.client;

    expect(registerResponse.body).toMatchObject({
      client: expect.objectContaining({ id: createdClient.id, name: clientName }),
      code: expect.any(String)
    });

    const listResponse = await request(app)
      .get('/clients')
      .query({ start: 0, length: 10, 'search[value]': clientName })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(listResponse.body).toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: createdClient.id, name: clientName })]
    });

    const editResponse = await request(app)
      .put(`/clients/${createdClient.id}`)
      .send({ name: updatedClientName })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(editResponse.body).toMatchObject({
      client: expect.objectContaining({ id: createdClient.id, name: updatedClientName }),
      code: expect.any(String)
    });

    await expect(prisma.client.findUnique({
      where: { id: createdClient.id },
      select: { id: true, name: true }
    })).resolves.toEqual({
      id: createdClient.id,
      name: updatedClientName
    });
  });

  it('conserva el tipo y el código del error específico producido por los servicios', async () => {
    const missingId = '00000000-0000-4000-8000-000000000000';

    const response = await request(app)
      .put(`/clients/${missingId}`)
      .send({ name: 'Cliente inexistente' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toMatchObject({
      type: 'ClientNotFound',
      code: 'CLIENT_NOT_FOUND',
      message: 'Cliente no encontrado'
    });
  });
});
