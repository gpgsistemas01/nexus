import { Worker } from 'node:worker_threads';
import { INVENTORY_IMPORT_PROCESSING_LIMITS } from '../../../constants/inventoryImport.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';

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
        return await new Promise((resolve, reject) => {
            let settled = false;
            const finish = (error, result) => {
                if (settled) return;
                settled = true;
                error ? reject(error) : resolve(result);
            };
            worker = new Worker(new URL('./inventoryWorkbookWorker.js', import.meta.url), {
                workerData: data,
                resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 }
            });
            abort = () => finish(signal.reason ?? new InventoryImportError());
            signal?.addEventListener('abort', abort, { once: true });
            timer = setTimeout(() => finish(new InventoryImportError('LIMIT')), INVENTORY_IMPORT_PROCESSING_LIMITS.workerTimeoutMs);
            worker.on('message', message => finish(message.error ? new InventoryImportError(message.error.kind) : null, message.result));
            worker.on('error', () => finish(new InventoryImportError('FILE')));
            worker.on('exit', () => finish(new InventoryImportError('FILE')));
        });
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        await worker?.terminate();
        occupied = false;
    }
};
