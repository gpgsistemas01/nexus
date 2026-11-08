import busboy from 'busboy';
import { INVENTORY_IMPORT_LIMITS } from '../shared/constants/inventoryImport.js';
import { InventoryImportError } from '../errors/warehouse/inventoryImportError.js';

export const readInventoryImportUpload = req => new Promise((resolve, reject) => {
    let parser;
    try {
        parser = busboy({ headers: req.headers, defParamCharset: 'utf8', limits: { files: 1, fields: 0, parts: 2, fileSize: INVENTORY_IMPORT_LIMITS.maxBytes + 1 } });
    } catch {
        reject(new InventoryImportError());
        return;
    }
    let filename;
    let buffer;
    let failed = false;
    let received = false;
    const abort = () => fail(new InventoryImportError());
    const timer = setTimeout(() => fail(new InventoryImportError('LIMIT')), 15000);
    const cleanup = () => { clearTimeout(timer); req.off('aborted', abort); };
    const fail = error => {
        if (failed) return;
        failed = true;
        cleanup();
        req.unpipe(parser);
        req.resume();
        buffer = undefined;
        reject(error);
    };
    req.once('aborted', abort);
    parser.on('file', (field, stream, info) => {
        if (field !== 'file' || received || !/\.xlsx$/i.test(info.filename ?? '')) {
            stream.resume();
            return fail(new InventoryImportError());
        }
        received = true;
        filename = info.filename.replace(/.*[\\/]/, '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 120);
        const chunks = [];
        stream.on('limit', () => fail(new InventoryImportError('LIMIT')));
        stream.on('data', chunk => { if (!failed) chunks.push(chunk); });
        stream.on('end', () => { if (!failed) buffer = Buffer.concat(chunks); chunks.length = 0; });
        stream.on('error', () => fail(new InventoryImportError()));
    });
    for (const event of ['filesLimit', 'fieldsLimit', 'partsLimit', 'error']) parser.on(event, () => fail(new InventoryImportError()));
    parser.on('close', () => {
        cleanup();
        if (failed) return;
        if (!buffer?.length) return fail(new InventoryImportError());
        resolve({ filename, buffer });
    });
    req.pipe(parser);
});
