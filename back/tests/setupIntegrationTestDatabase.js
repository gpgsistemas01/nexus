import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { validateTestDatabaseEnv } from '../scripts/verifyTestDatabaseEnv.js';

validateTestDatabaseEnv();

if (!existsSync(resolve('generated/prisma/client.ts'))) {
  throw new Error(
    'No existe el cliente Prisma de pruebas. Ejecuta `npm run test:integration`, que aplica migraciones y genera el cliente antes de Vitest.'
  );
}
