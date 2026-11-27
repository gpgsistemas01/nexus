import { Worker } from 'node:worker_threads';
import { INVENTORY_IMPORT_PROCESSING_LIMITS } from '../../../constants/inventoryImport.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';
import { INVENTORY_IMPORT_MODES } from '../../../shared/constants/inventoryImport.js';
import { assertInventoryStockCountTemplateIsCurrent, sealInventoryStockCountTemplate } from './inventoryStockCountTemplate.js';

// Un solo trabajo pesado por proceso; las rutas normales no pasan por esta puerta.
let occupied = false;

export const processInventoryWorkbook = async (data, signal) => {
    if (occupied) throw new InventoryImportError('BUSY');
    signal?.throwIfAborted();
    occupied = true;
    let worker;
    let timer;
    let abort;
    try {
        const isStockCount = data.config?.mode === INVENTORY_IMPORT_MODES.ADJUST;
        const startedAt = Date.now();
        const workerData = isStockCount && data.action === 'template'
            ? { ...data, templateSeal: sealInventoryStockCountTemplate(data.config.resource, startedAt) }
            : data;
        const result = await new Promise((resolve, reject) => {
            let settled = false;
            const finish = (error, result) => {
                if (settled) return;
                settled = true;
                error ? reject(error) : resolve(result);
            };
            worker = new Worker(new URL('./inventoryWorkbookWorker.js', import.meta.url), {
                workerData,
                resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 }
            });
            abort = () => finish(signal.reason ?? new InventoryImportError());
            signal?.addEventListener('abort', abort, { once: true });
            timer = setTimeout(() => finish(new InventoryImportError('LIMIT')), INVENTORY_IMPORT_PROCESSING_LIMITS.workerTimeoutMs);
            worker.on('message', message => finish(message.error ? new InventoryImportError(message.error.kind) : null, message.result));
            worker.on('error', () => finish(new InventoryImportError('FILE')));
            worker.on('exit', () => finish(new InventoryImportError('FILE')));
        });
        if (isStockCount && data.action === 'read') {
            assertInventoryStockCountTemplateIsCurrent(data.config.resource, result.templateSeal, startedAt);
            return result.rows;
        }
        return result;
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        await worker?.terminate();
        occupied = false;
    }
};
