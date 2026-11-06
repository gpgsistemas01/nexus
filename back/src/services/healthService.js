import { prisma } from '../lib/prisma.js';

let pendingCheck = null;

export const checkDatabaseReady = async ({ timeoutMs = 2000 } = {}) => {
    // Compartir la consulta pendiente evita acumular consultas si PostgreSQL se bloquea.
    if (!pendingCheck) {
        pendingCheck = Promise.resolve().then(() => prisma.$queryRaw`SELECT 1`)
            .then(() => true, () => false)
            .finally(() => { pendingCheck = null; });
    }

    let timer;
    try {
        return await Promise.race([
            pendingCheck,
            new Promise(resolve => { timer = setTimeout(() => resolve(false), timeoutMs); })
        ]);
    } finally {
        clearTimeout(timer);
    }
};
