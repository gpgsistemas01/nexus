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
    const maxSheetRow = limits.maxRows * 10 + 1;
    const traversal = { limits: { maxRows: maxSheetRow + 1, maxColumns: config.columns.length + 1,
        maxCells: (maxSheetRow + 1) * (config.columns.length + 1), maxOutputBytes: processing.maxUncompressedBytes } };
    for (const row of workbook.getRowsIterator('Datos', traversal)) {
        if (row.row > maxSheetRow || row.cells.some(cell => !columns.includes(cell.column))) fail('LIMIT');
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
    const isWaste = config.resource === 'wastes';
    const applicableCatalogs = [];
    if (config.mode === 'create') {
        applicableCatalogs.push({
            key: 'supplierCode',
            header: 'Proveedor (código | nombre)',
            values: (catalogs.suppliers ?? []).map(item => `${item.code} | ${item.tradeName}`)
        });
        if (isWaste) {
            applicableCatalogs.push({ key: 'materialId', header: 'Material de referencia', values: catalogs.materials ?? [] });
        } else {
            applicableCatalogs.push(
                { key: 'presentationName', header: 'Presentación', values: (catalogs.presentations ?? []).map(item => item.name) },
                { key: 'unitLabel', header: 'Unidad', values: catalogs.units ?? [] }
            );
        }
    } else if (config.mode === 'adjust') {
        applicableCatalogs.push({ key: 'reasonId', header: 'Motivo', values: catalogs.reasons ?? [] });
    }
    const operationDescription = config.mode === 'create'
        ? `Alta crea registros nuevos. ${isWaste
            ? 'Completa proveedor, material de referencia, mínimo, costo, activo, cantidad inicial y observaciones; captura medidas o pesos según la presentación.'
            : 'Completa proveedor, material, presentación, unidad, mínimo, costo, activo, cantidad inicial y observaciones.'}`
        : config.mode === 'update'
            ? 'Editar datos modifica nombre, mínimo, costo y activo. No modifica las existencias; conserva el proveedor y los demás datos del registro.'
            : 'Ajustar existencias reemplaza el saldo con el conteo físico final. Captura stock contado, motivo activo y observaciones en cada fila.';
    const limitDescription = config.mode === 'create'
        ? `Hasta ${limits.maxRows} filas y ${limits.maxBytes / (1024 * 1024)} MiB por archivo. Conserva hojas y encabezados; retira filas vacías que no quieras importar.`
        : `Hasta ${limits.maxRows} filas y ${limits.maxBytes / (1024 * 1024)} MiB por archivo. La plantilla incluye registros coincidentes; si hay más, filtra por proveedor o nombre y procesa grupos de hasta ${limits.maxRows}. Conserva hojas y encabezados.`;
    const referenceDescription = config.mode === 'create'
        ? 'Las columnas grises son datos de consulta, como stock actual y conversión. No las edites; captura sólo en las columnas blancas.'
        : 'Las columnas grises son datos de consulta e identificadores/versiones del destino. No las edites: consérvalos para identificar el registro y sus datos actuales.';
    const captureDescription = config.mode === 'adjust'
        ? 'Una fila por registro. Captura el saldo como número; no uses fórmulas.'
        : 'Una fila por registro. Usa números sin signo de moneda. Activo: SI o NO. No uses fórmulas.';
    const catalogCaptureInstructions = [
        ...(applicableCatalogs.some(({ key }) => key === 'supplierCode')
            ? ['Proveedor: elige la opción completa con código y nombre.'] : []),
        ...(applicableCatalogs.some(({ key }) => key === 'presentationName' || key === 'unitLabel')
            ? ['Presentación y unidad: elige la opción completa tal como aparece.'] : []),
        ...(applicableCatalogs.some(({ key }) => key === 'materialId')
            ? ['Material de referencia: conserva el ID incluido en la opción completa.'] : []),
        ...(applicableCatalogs.some(({ key }) => key === 'reasonId')
            ? ['Motivo: usa el valor completo con formato UUID | nombre.'] : [])
    ];
    const instructions = [
        ['Formato', INVENTORY_IMPORT_FORMAT], ['Recurso', config.resource], ['Operacion', config.mode],
        ['Operación del archivo', `${INVENTORY_IMPORT_MODE_LABELS[config.mode]}. Todas las filas realizan esta operación. Selecciona la misma operación al importar; para otra operación descarga otra plantilla.`],
        ['Qué hacer', operationDescription],
        ['Límites', limitDescription],
        ['Columnas editables', `Para esta operación captura sólo: ${config.columns.filter(([, key]) => !config.readonlyFields.includes(key)).map(([header]) => header).join(', ')}.`],
        ['Columnas grises', `${referenceDescription} Las columnas blancas son las de captura indicadas para esta operación.`],
        ['Identificadores', config.mode === 'create'
            ? 'El sistema genera los IDs de los registros nuevos.'
            : 'Los IDs y versiones del destino se incluyen automáticamente; no los escribas ni cambies. El nombre no identifica el destino.'],
        ['Captura', captureDescription],
        ...(applicableCatalogs.length ? [['Catálogos', `Catalogos incluye sólo: ${applicableCatalogs.map(({ header }) => header).join(', ')}. ${catalogCaptureInstructions.join(' ')} No son registros de inventario para importar.`]] : []),
        ['Duplicados', 'Se revisan por identidad dentro del archivo y contra los registros existentes. Si una fila está repetida o tiene errores, no se aplica ninguna fila.'],
        ...(config.mode === 'create' ? [['Cantidad inicial', 'Es cantidad por presentación, no área ni peso. Pieza exige enteros.']] : []),
        ...(config.mode === 'adjust' ? [
            ['Conteo físico', 'Stock contado es el saldo final en la unidad del registro; cero es válido y vacío se rechaza. Stock actual y Conversión son referencias y no se suman.'],
            ['Corte del conteo', 'Usa un conteo físico actual y evita movimientos mientras capturas. Si cambió una versión, descarga una plantilla nueva y vuelve a verificar el conteo.']
        ] : []),
        ...(config.mode === 'create' && isWaste ? [['Medidas', 'Base y altura en metros. En Rollo deja ambas vacías: el servidor las calcula con los tres pesos en kg.']] : []),
        ...(config.mode === 'update' ? [['Actualización', isWaste
            ? 'Material, mínimo, costo y activo corresponden a la merma. Un vacío no borra datos.'
            : 'Nombre y mínimo se comparten entre proveedores. Costo y activo corresponden a cada proveedor. Un vacío no borra datos.']] : []),
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
    workbook.setRowValues('Catalogos', 1, 'A', applicableCatalogs.length
        ? applicableCatalogs.map(({ header }) => header)
        : ['Sin catálogos aplicables']);
    applicableCatalogs.forEach(({ key }, index) => {
        workbook.setColWidth('Catalogos', spreadsheetColumn(index + 1), key === 'materialId' ? 100 : key === 'reasonId' ? 65 : 45);
    });
    const count = Math.max(0, ...applicableCatalogs.map(({ values }) => values.length));
    for (let index = 0; index < count; index++) {
        workbook.setRowValues('Catalogos', index + 2, 'A', applicableCatalogs.map(({ values }) => values[index] ?? null));
    }
    const lists = Object.fromEntries(applicableCatalogs.map(({ key, values }, index) => [
        key, [spreadsheetColumn(index + 1), values.length]
    ]));
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
