import { parentPort, workerData } from 'node:worker_threads';
import { Workbook, isResourceLimitError } from '@sheetkit/node';
import unzipper from 'unzipper';
import { createSpreadsheet, spreadsheetColumn } from '../../../utils/spreadsheetUtils.js';
import { INVENTORY_IMPORT_FORMAT, INVENTORY_IMPORT_PROCESSING_LIMITS as processing } from '../../../constants/inventoryImport.js';
import { INVENTORY_IMPORT_LIMITS as limits,
    INVENTORY_IMPORT_MODE_LABELS } from '../../../shared/constants/inventoryImport.js';

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
    if (zip.files.length > processing.maxZipEntries
        || zip.files.reduce((sum, file) => sum + file.uncompressedSize, 0) > processing.maxUncompressedBytes) fail('LIMIT');
    if (zip.files.some(file => /vbaProject|externalLinks|embeddings|activeX/i.test(file.path))) fail('FILE');
    // Comprobar el tamaño real al inflar: la cabecera ZIP recibida no es una fuente confiable.
    let expanded = 0;
    for (const file of zip.files) {
        const inspect = /(?:^\[Content_Types\]\.xml$|\.rels$)/i.test(file.path);
        const chunks = [];
        for await (const chunk of file.stream()) {
            expanded += chunk.length;
            if (expanded > processing.maxUncompressedBytes) fail('LIMIT');
            if (inspect) chunks.push(chunk);
        }
        if (inspect && /macroEnabled|vbaProject|oleObject|TargetMode\s*=\s*["']External["']/i.test(Buffer.concat(chunks).toString('utf8'))) fail('FILE');
    }
    const workbook = await Workbook.openBuffer(buffer, {
        maxOuterInputBytes: limits.maxBytes, maxUnzipSize: processing.maxUncompressedBytes,
        maxXmlPartBytes: processing.maxUncompressedBytes, maxZipEntries: processing.maxZipEntries,
        readMode: 'eager'
    });
    if (workbook.sheetNames.length !== 3
        || !['Datos', 'Instrucciones', 'Catalogos'].every(name => workbook.sheetNames.includes(name))) fail('FILE');
    const readCell = (sheet, cell) => {
        const value = workbook.getCellValue(sheet, cell);
        if (typeof value === 'string' && (workbook.getCellRichText(sheet, cell) || workbook.getCellHyperlink(sheet, cell))) fail('FILE');
        return scalar(value);
    };
    if (readCell('Instrucciones', 'B1') !== INVENTORY_IMPORT_FORMAT
        || readCell('Instrucciones', 'B2') !== config.resource
        || readCell('Instrucciones', 'B3') !== config.mode) fail('FILE');
    const columns = config.columns.map((_, index) => spreadsheetColumn(index + 1));
    if (!config.columns.every(([header], index) => readCell('Datos', `${columns[index]}1`) === header)) fail('FILE');
    const rows = [];
    const traversal = { limits: { maxRows: 1001, maxColumns: config.columns.length + 1,
        maxCells: 1001 * (config.columns.length + 1), maxOutputBytes: processing.maxUncompressedBytes } };
    for (const row of workbook.getRowsIterator('Datos', traversal)) {
        if (row.row > 1001 || row.cells.some(cell => !columns.includes(cell.column))) fail('LIMIT');
        if (row.row === 1) continue;
        const cells = new Map(row.cells.map(cell => [cell.column, cell]));
        const values = columns.map(column => {
            const cell = cells.get(column);
            if (cell && !['empty', 'string', 'number', 'boolean'].includes(cell.valueType)) fail('FILE');
            return readCell('Datos', `${column}${row.row}`);
        });
        if (values.every(value => value === '')) continue;
        if (rows.length >= limits.maxRows) fail('LIMIT');
        rows.push({ row: row.row, values: Object.fromEntries(config.columns.map(([, key], index) => [key, values[index]])) });
    }
    if (!rows.length) fail('FILE');
    return rows;
};

const createDataWorkbook = (columns, rows) => {
    const workbook = createSpreadsheet('Datos');
    workbook.setPanes('Datos', 'A2');
    const headerStyle = workbook.addStyle({ font: { bold: true, color: '#FFFFFF' },
        fill: { pattern: 'solid', fgColor: '#174A5B' }, alignment: { wrapText: true, vertical: 'center' } });
    columns.forEach(([header, key], index) => {
        const column = spreadsheetColumn(index + 1);
        workbook.setColWidth('Datos', column, key === 'materialId' ? 80 : ['id', 'supplierId'].includes(key) ? 40 : 25);
        workbook.setCellStyle('Datos', `${column}1`, headerStyle);
    });
    workbook.setRowValues('Datos', 1, 'A', columns.map(([header]) => header));
    workbook.setRowHeight('Datos', 1, 32);
    rows.forEach((row, index) => workbook.setRowValues('Datos', index + 2, 'A', columns.map(([, key]) => row[key] ?? '')));
    return workbook;
};

const template = async ({ config, rows = [], catalogs }) => {
    const workbook = createDataWorkbook(config.columns, rows);
    workbook.newSheet('Instrucciones');
    workbook.setColWidth('Instrucciones', 'A', 32);
    workbook.setColWidth('Instrucciones', 'B', 110);
    const instructions = [
        ['Formato', INVENTORY_IMPORT_FORMAT], ['Recurso', config.resource], ['Operacion', config.mode],
        ['Operación del archivo', `${INVENTORY_IMPORT_MODE_LABELS[config.mode]}. Todas las filas realizan esta operación. Selecciona la misma operación al importar; para otra operación descarga otra plantilla.`],
        ['Estructura de inventario', 'Las primeras columnas siguen el orden del reporte: Proveedor, Material, Base, Altura, Stock actual, Stock mínimo, Presentación, Conversión, Unidad y Costo unitario. En ajuste se omite el costo. Después se agregan Activo, IDs/versiones y los campos de la operación.'],
        ['Límites', 'Hasta 100 filas y 2 MiB. Conserva hojas, encabezados, identificadores y versiones.'],
        ['Identificadores', 'Altas: el sistema genera los IDs nuevos. Edición y ajuste: los IDs y versiones del destino se incluyen automáticamente según tu permiso operativo. Conserva las columnas grises; el nombre no identifica el destino.'],
        ['Captura', 'Una fila por registro. Usa números sin signo de moneda. Activo: SI o NO. No uses fórmulas.'],
        ['Catálogos', 'Listas de hasta 500 opciones. Elige proveedor, presentación y unidad; en merma selecciona la opción completa del material de referencia, incluido su ID, sin escribirlo manualmente.'],
        ['Duplicados', 'Se revisan por identidad dentro del archivo y contra los registros existentes. Si una fila está repetida o tiene errores, no se aplica ninguna fila.'],
        ['Cantidad inicial', 'Sólo en altas. Es cantidad por presentación, no área ni peso. Pieza exige enteros.'],
        ['Conteo físico', 'En ajuste, Stock contado es el saldo final contado por presentación; cero es válido y vacío se rechaza. Captura Motivo y Observaciones en cada fila. Stock actual y Conversión son referencias y no se suman.'],
        ['Corte del conteo', 'Usa un conteo físico actual y evita movimientos mientras capturas. Si cambió una versión, descarga una plantilla nueva y vuelve a verificar el conteo; no copies saldos antiguos sin conciliarlos.'],
        ['Medidas', 'Base y altura en metros. Consumibles no tienen dimensiones. En Rollo de merma deja ambas vacías: el servidor las calcula con los tres pesos en kg.'],
        ['Actualización', 'Nombre y mínimo se comparten entre proveedores. Costo y activo corresponden a cada proveedor. Un vacío no borra datos.'],
        ['Confirmación', 'Validar sólo genera una vista previa. Confirmar aplica todas las filas válidas juntas; si alguna falla, no se aplica ninguna.'],
        ['Archivos', 'El servidor descarta el XLSX después del análisis. El original de tu equipo permanece bajo tu control.']
    ];
    const textStyle = workbook.addStyle({ alignment: { wrapText: true, vertical: 'top' } });
    instructions.forEach((row, index) => {
        workbook.setRowValues('Instrucciones', index + 1, 'A', row);
        workbook.setRowHeight('Instrucciones', index + 1, 40);
        for (const column of ['A', 'B']) workbook.setCellStyle('Instrucciones', `${column}${index + 1}`, textStyle);
    });
    workbook.newSheet('Catalogos');
    catalogs.reasons ??= [];
    workbook.setRowValues('Catalogos', 1, 'A', ['Proveedor (código | nombre)', 'Proveedor', 'Presentación', 'Unidad', 'Material de referencia', 'Motivo']);
    [20, 45, 25, 35, 100, 65].forEach((width, index) => workbook.setColWidth('Catalogos', spreadsheetColumn(index + 1), width));
    const count = Math.max(catalogs.suppliers.length, catalogs.presentations.length, catalogs.units.length, catalogs.materials.length, catalogs.reasons.length);
    for (let index = 0; index < count; index++) workbook.setRowValues('Catalogos', index + 2, 'A', [
        catalogs.suppliers[index] ? `${catalogs.suppliers[index].code} | ${catalogs.suppliers[index].tradeName}` : null,
        catalogs.suppliers[index]?.tradeName,
        catalogs.presentations[index]?.name, catalogs.units[index], catalogs.materials[index], catalogs.reasons[index]
    ].map(value => value ?? null));
    const lists = { supplierCode: ['A', catalogs.suppliers.length], presentationName: ['C', catalogs.presentations.length],
        unitLabel: ['D', catalogs.units.length], materialId: ['E', catalogs.materials.length], reasonId: ['F', catalogs.reasons.length] };
    const identityStyle = workbook.addStyle({ fill: { pattern: 'solid', fgColor: '#E7EDF0' } });
    for (let index = 0; index < config.columns.length; index++) {
        const key = config.columns[index][1];
        const column = spreadsheetColumn(index + 1);
        const sqref = `${column}2:${column}${limits.maxRows + 1}`;
        if (key === 'isActive' && !config.readonlyFields.includes(key)) workbook.addDataValidation('Datos', { sqref, validationType: 'list', allowBlank: false, formula1: '"SI,NO"' });
        const list = lists[key];
        if (list?.[1]) workbook.addDataValidation('Datos', { sqref, validationType: 'list', allowBlank: false,
            formula1: `'Catalogos'!$${list[0]}$2:$${list[0]}$${list[1] + 1}` });
        if (config.readonlyFields.includes(key)) {
            for (let row = 2; row <= limits.maxRows + 1; row++) workbook.setCellStyle('Datos', `${column}${row}`, identityStyle);
        }
    }
    return new Uint8Array(await workbook.writeBuffer());
};

const errors = async ({ rows }) => {
    const columns = [['fila', 'row'], ['nombre', 'name'], ['columna', 'column'], ['mensaje', 'message']];
    const workbook = createDataWorkbook(columns, rows);
    workbook.setColWidth('Datos', 'D', 90);
    const textStyle = workbook.addStyle({ alignment: { wrapText: true, vertical: 'top' } });
    rows.forEach((_row, index) => {
        workbook.setRowHeight('Datos', index + 2, 60);
        for (let column = 1; column <= columns.length; column++) workbook.setCellStyle('Datos', `${spreadsheetColumn(column)}${index + 2}`, textStyle);
    });
    return new Uint8Array(await workbook.writeBuffer());
};

try {
    const actions = { read, template, errors };
    if (!Object.hasOwn(actions, workerData.action)) fail('FILE');
    const result = await actions[workerData.action](workerData);
    parentPort.postMessage({ result });
} catch (error) {
    parentPort.postMessage({ error: { kind: isResourceLimitError(error) ? 'LIMIT' : error.kind ?? 'FILE' } });
}
