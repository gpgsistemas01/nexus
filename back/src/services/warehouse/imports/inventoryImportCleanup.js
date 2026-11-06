import { Prisma } from '../../../../generated/prisma/client.ts';
import { getDb } from '../../../repository/baseRepository.js';
import { createServiceLogger } from '../../../utils/logger.js';

const logger = createServiceLogger('warehouse.inventoryImport.cleanup');

export const expireInventoryImportDrafts = async ({ db = getDb(), now = new Date() } = {}) => {
    const expired = await db.inventoryImport.findMany({ where: { status: 'DRAFT', expiresAt: { lte: now } },
        orderBy: [{ expiresAt: 'asc' }, { id: 'asc' }], take: 100, select: { id: true } });
    if (!expired.length) return 0;
    const result = await db.inventoryImport.updateMany({ where: {
        id: { in: expired.map(row => row.id) }, status: 'DRAFT', expiresAt: { lte: now }
    }, data: { status: 'EXPIRED', payload: Prisma.DbNull, preview: Prisma.DbNull } });
    return result.count;
};

export const startInventoryImportCleanup = ({ intervalMs = 300000 } = {}) => {
    let running = null;
    let stopped = false;
    const run = () => {
        if (running || stopped) return;
        running = expireInventoryImportDrafts()
            .catch(error => logger.error({ err: error }, 'No se pudieron limpiar borradores de importación vencidos'))
            .finally(() => { running = null; });
    };
    const timer = setInterval(run, intervalMs);
    timer.unref();
    run();
    return async () => { stopped = true; clearInterval(timer); await running; };
};
