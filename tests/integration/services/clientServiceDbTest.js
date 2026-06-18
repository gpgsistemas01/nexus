import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const clientName = `Cliente integración ${Date.now()}-${Math.random().toString(36).slice(2)}`;
const updatedClientName = `${clientName} actualizado`;

let prisma;
let services;

const cleanupClient = async () => {
  await prisma.client.deleteMany({
    where: {
      name: {
        in: [clientName, updatedClientName]
      }
    }
  });
};

describeDb('clientService database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      import('../../../src/services/sales/clientService.js')
    ]);

    await cleanupClient();
  });


  it('guarda, consulta y actualiza clientes directamente en la base de pruebas', async () => {
    const createdClient = await services.createClient({
      clientDto: { name: clientName }
    });

    await expect(services.findClientById({ id: createdClient.id })).resolves.toEqual({
      id: createdClient.id,
      name: clientName
    });

    await expect(services.findAllClients({ search: clientName })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({ id: createdClient.id, name: clientName })]
    });

    await expect(services.updateClient({
      id: createdClient.id,
      clientDto: { name: updatedClientName }
    })).resolves.toMatchObject({
      id: createdClient.id,
      name: updatedClientName
    });

    await expect(prisma.client.findUnique({
      where: { id: createdClient.id },
      select: { id: true, name: true }
    })).resolves.toEqual({
      id: createdClient.id,
      name: updatedClientName
    });
  });
});
