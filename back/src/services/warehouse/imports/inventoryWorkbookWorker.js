import { parentPort, workerData } from 'node:worker_threads';
import ExcelJS from 'exceljs';
import unzipper from 'unzipper';
import { INVENTORY_IMPORT_FORMAT, INVENTORY_IMPORT_LIMITS as limits } from '../../../shared/constants/inventoryImport.js';

const fail = kind => { const error = new Error(kind); error.kind = kind; throw error; };
const scalar = value => {
    if (value === undefined || value === null) return '';
    if (!['string', 'number', 'boolean'].includes(typeof value)) fail('FILE');
    if (typeof value === 'number' && !Number.isFinite(value)) fail('FILE');
    if (String(value).length > limits.maxCellLength) fail('LIMIT');
    return typeof value === 'string' ? value.trim() : value;
};

const read = async ({ bytes, config }) => {
    const buffer = Buffer.from(bytes);
    if (!buffer.length || buffer.length > limits.maxBytes) fail('LIMIT');
    const zip = await unzipper.Open.buffer(buffer);
    if (zip.files.length > limits.maxZipEntries
        || zip.files.reduce((sum, file) => sum + file.uncompressedSize, 0) > limits.maxUncompressedBytes) fail('LIMIT');
    if (zip.files.some(file => /vbaProject|externalLinks|embeddings|activeX/i.test(file.path))) fail('FILE');
    // Comprobar el tamaño real al inflar: la cabecera ZIP recibida no es una fuente confiable.
    let expanded = 0;
    for (const file of zip.files) {
        const inspect = /(?:^\[Content_Types\]\.xml$|\.rels$)/i.test(file.path);
        const chunks = [];
        for await (const chunk of file.stream()) {
            expanded += chunk.length;
            if (expanded > limits.maxUncompressedBytes) fail('LIMIT');
            if (inspect) chunks.push(chunk);
        }
        if (inspect && /macroEnabled|vbaProject|oleObject|TargetMode\s*=\s*["']External["']/i.test(Buffer.concat(chunks).toString('utf8'))) fail('FILE');
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    if (workbook.worksheets.length !== 3
        || !['Datos', 'Instrucciones', 'Catalogos'].every(name => workbook.getWorksheet(name))) fail('FILE');
    const instructions = workbook.getWorksheet('Instrucciones');
    if (instructions.getCell('B1').value !== INVENTORY_IMPORT_FORMAT
        || instructions.getCell('B2').value !== config.resource
        || instructions.getCell('B3').value !== config.mode) fail('FILE');
    const sheet = workbook.getWorksheet('Datos');
    if (sheet.rowCount > 1001 || sheet.columnCount > config.columns.length) fail('LIMIT');
    const headers = config.columns.map(([header]) => header);
    if (!headers.every((header, index) => sheet.getRow(1).getCell(index + 1).value === header)) fail('FILE');
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const values = config.columns.map((_, index) => scalar(row.getCell(index + 1).value));
        if (values.every(value => value === '')) return;
        if (rows.length >= limits.maxRows) fail('LIMIT');
        rows.push({ row: rowNumber, values: Object.fromEntries(config.columns.map(([, key], index) => [key, values[index]])) });
    });
    if (!rows.length) fail('FILE');
    return rows;
};

const template = async ({ config, rows = [], catalogs }) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Datos', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = config.columns.map(([header]) => ({ header, width: header.startsWith('id_') ? 40 : 25 }));
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF174A5B' } };
    sheet.getRow(1).height = 32;
    sheet.getRow(1).alignment = { wrapText: true, vertical: 'middle' };
    for (const row of rows) sheet.addRow(config.columns.map(([, key]) => row[key] ?? ''));
    const instructions = workbook.addWorksheet('Instrucciones');
    instructions.columns = [{ width: 32 }, { width: 110 }];
    for (const row of [
        ['Formato', INVENTORY_IMPORT_FORMAT], ['Recurso', config.resource], ['Operacion', config.mode],
        ['Límites', 'Hasta 100 filas y 2 MiB. Conserva hojas, encabezados, identificadores y versiones.'],
        ['Captura', 'Una fila por registro. Usa números sin signo de moneda. Activo: SI o NO. No uses fórmulas.'],
        ['Catálogos', 'Las listas contienen hasta 500 opciones. Para mermas, selecciona proveedor al descargar y usa el material de referencia de ese proveedor.'],
        ['Cantidad inicial', 'Sólo en altas. Es cantidad por presentación, no área ni peso. Pieza exige enteros.'],
        ['Medidas', 'Base y altura en metros. Consumibles no tienen dimensiones. En Rollo de merma deja ambas vacías: el servidor las calcula con los tres pesos en kg.'],
        ['Actualización', 'Nombre y mínimo se comparten entre proveedores. Costo y activo corresponden a cada proveedor. Un vacío no borra datos.'],
        ['Confirmación', 'Primero valida y revisa. La confirmación aplica todo el lote o no aplica nada.'],
        ['Archivos', 'El servidor descarta el XLSX después del análisis. El original de tu equipo permanece bajo tu control.']
    ]) instructions.addRow(row);
    instructions.eachRow(row => { row.alignment = { wrapText: true, vertical: 'top' }; row.height = 40; });
    const lookups = workbook.addWorksheet('Catalogos');
    lookups.columns = [
        { header: 'proveedor_codigo', width: 20 }, { header: 'proveedor', width: 45 },
        { header: 'presentacion', width: 25 }, { header: 'unidad', width: 35 },
        { header: 'material_referencia', width: 100 }
    ];
    const count = Math.max(catalogs.suppliers.length, catalogs.presentations.length, catalogs.units.length, catalogs.materials.length);
    for (let index = 0; index < count; index++) lookups.addRow([
        catalogs.suppliers[index]?.code, catalogs.suppliers[index]?.tradeName,
        catalogs.presentations[index]?.name, catalogs.units[index], catalogs.materials[index]
    ]);
    const lists = { supplierCode: ['A', catalogs.suppliers.length], presentationName: ['C', catalogs.presentations.length],
        unitLabel: ['D', catalogs.units.length], materialId: ['E', catalogs.materials.length] };
    for (let index = 0; index < config.columns.length; index++) {
        const key = config.columns[index][1];
        for (let number = 2; number <= limits.maxRows + 1; number++) {
            const cell = sheet.getRow(number).getCell(index + 1);
            if (key === 'isActive') cell.dataValidation = { type: 'list', allowBlank: false, formulae: ['"SI,NO"'] };
            const list = lists[key];
            if (list?.[1]) cell.dataValidation = { type: 'list', allowBlank: false,
                formulae: [`'Catalogos'!$${list[0]}$2:$${list[0]}$${list[1] + 1}`] };
            if (key.startsWith('expected') || key === 'id' || key === 'supplierId') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7EDF0' } };
            }
        }
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
};

try {
    const result = workerData.action === 'read' ? await read(workerData) : await template(workerData);
    parentPort.postMessage({ result });
} catch (error) {
    parentPort.postMessage({ error: { kind: error.kind ?? 'FILE' } });
}
