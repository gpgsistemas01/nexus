import { successCodeMessages } from '../../../shared/constants/apiSuccessCodes.js';
import { readInventoryImportUpload } from '../../../middleware/inventoryImportUpload.js';
import { createInventoryImportTemplate } from '../../../services/warehouse/imports/inventoryImportTemplateService.js';
import { previewInventoryImport, confirmInventoryImport, getInventoryImport, cancelInventoryImport,
    getInventoryImportErrors } from '../../../services/warehouse/imports/inventoryImportService.js';
import { emitInventoryUpdated } from '../../../utils/socketUtils.js';
import { logger } from '../../../utils/logger.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';

let preparing = false;

const withSignal = async (res, action) => {
    const controller = new AbortController();
    const closed = () => { if (!res.writableFinished) controller.abort(); };
    res.once('close', closed);
    try { return await action(controller.signal); }
    finally { res.off('close', closed); }
};

const sendWorkbook = (res, bytes, filename) => {
    res.set('Cache-Control', 'no-store');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`${filename}.xlsx`);
    res.send(Buffer.from(bytes));
};

export const getInventoryImportTemplate = async (req, res) => withSignal(res, async signal => {
    const bytes = await createInventoryImportTemplate({ user: req.user, resource: req.params.resource,
        mode: req.query.mode ?? 'create', query: req.query, signal });
    sendWorkbook(res, bytes, `plantilla_${req.params.resource}_${req.query.mode ?? 'create'}`);
});

export const prepareInventoryImport = async (req, res) => {
    if (preparing) throw new InventoryImportError('BUSY');
    preparing = true;
    try {
        return await withSignal(res, async signal => {
            const uploaded = await readInventoryImportUpload(req);
            try {
                const batch = await previewInventoryImport({ user: req.user, resource: req.params.resource,
                    mode: req.query.mode ?? 'create', ...uploaded, signal });
                res.set('Cache-Control', 'no-store');
                res.json({ code: successCodeMessages.INVENTORY_IMPORT_PREVIEW, batch });
            } finally { uploaded.buffer = null; }
        });
    } finally { preparing = false; }
};

export const applyInventoryImport = async (req, res) => {
    const result = await confirmInventoryImport({ user: req.user, id: req.params.id,
        expectedVersion: req.body.expectedVersion, operationId: req.body.operationId });
    if (!result.replayed) {
        try { emitInventoryUpdated({ context: result.batch.resource === 'wastes' ? 'waste' : 'material', source: 'inventory-import-completed' }); }
        catch (error) { logger.warn({ err: error, importId: req.params.id }, 'La importación se confirmó pero no se pudo notificar el inventario'); }
    }
    res.set('Cache-Control', 'no-store');
    res.json({ code: successCodeMessages.INVENTORY_IMPORT_COMPLETED, batch: result.batch });
};

export const readInventoryImport = async (req, res) => {
    const batch = await getInventoryImport({ id: req.params.id, user: req.user });
    res.set('Cache-Control', 'no-store');
    res.json({ batch });
};

export const discardInventoryImport = async (req, res) => {
    const batch = await cancelInventoryImport({ id: req.params.id, user: req.user });
    res.json({ code: successCodeMessages.INVENTORY_IMPORT_CANCELED, batch });
};

export const exportInventoryImportErrors = async (req, res) => withSignal(res, async signal => {
    const bytes = await getInventoryImportErrors({ id: req.params.id, user: req.user, signal });
    sendWorkbook(res, bytes, 'errores_importacion');
});
