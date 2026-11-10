import { describe, expect, it } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { inventoryWorkbook, writeInventoryWorkbook } from '../../../helpers/inventoryImportFixture.js';
import { getImportConfig } from '../../../../src/services/warehouse/imports/inventoryImportConfig.js';
import { processInventoryWorkbook } from '../../../../src/services/warehouse/imports/inventoryWorkbookService.js';
import { readExcelReport } from '../../../helpers/readExcelReport.js';

const config = getImportConfig('materials', 'create');
const catalogs = {
    suppliers: [{ code: 'PRO-001', tradeName: 'Proveedor' }],
    presentations: [{ name: 'Pieza' }, { name: 'Rollo' }],
    units: ['pza · Pieza'],
    materials: ['11111111-1111-4111-8111-111111111111 | Material | 2 × 3 | Pieza'],
    reasons: ['22222222-2222-4222-8222-222222222222 | Conteo físico']
};
const read = bytes => processInventoryWorkbook({ action: 'read', config, bytes });
describe('fronteras y contenido del libro de inventario', () => {
    it('el informe de errores contiene sólo sus columnas y conserva nombres como texto', async () => {
        const rows = [{ row: 3, name: '=1+1', column: 'cantidad_inicial', message: 'Usa unidades enteras.' },
            { row: 4, name: 'Lona', column: 'nombre', message: 'El registro está repetido.' }];
        const bytes = await processInventoryWorkbook({ action: 'errors', rows });
        const report = await readExcelReport(Buffer.from(bytes));
        expect(report.workbook.worksheets.map(sheet => sheet.name)).toEqual(['Datos']);
        expect(report.rows).toEqual([['fila', 'nombre', 'columna', 'mensaje'],
            ...rows.map(row => [row.row, row.name, row.column, row.message])]);
        expect(report.sheet.getCell('B2').value).toBe('=1+1');
        await expect(read(bytes)).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
    });
    it('admite 500 filas, ignora vacías y conserva tipos de las celdas', async () => {
        const rows = Array.from({ length: 500 }, (_, index) => ({ name: `Material ${index}`, maxUnitCost: 12.123456, isActive: true }));
        const parsed = await read(await inventoryWorkbook({ rows: [{}, ...rows] }));
        expect(parsed).toHaveLength(500);
        expect(parsed[0]).toMatchObject({ row: 3, values: { name: 'Material 0', maxUnitCost: 12.123456, isActive: true } });
    });
    it('rechaza 501 filas antes de validar catálogos', async () => {
        await expect(read(await inventoryWorkbook({ rows: Array.from({ length: 501 }, () => ({ name: 'Material' })) })))
            .rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it('genera y vuelve a leer una plantilla con 500 filas completas', async () => {
        const updateConfig = getImportConfig('materials', 'update');
        const rows = Array.from({ length: 500 }, (_, index) => ({ name: `Material ${index}` }));
        const bytes = await processInventoryWorkbook({
            action: 'template',
            config: updateConfig,
            rows,
            catalogs,
        });

        const parsed = await processInventoryWorkbook({
            action: 'read',
            config: updateConfig,
            bytes,
        });

        expect(parsed).toHaveLength(500);
        expect(parsed.at(-1)).toMatchObject({ row: 501, values: { name: 'Material 499' } });
    });
    it.each([
        ['fórmula', book => { book.getWorksheet('Datos').getCell('A2').value = { formula: '1+1', result: 2 }; }],
        ['encabezado', book => { book.getWorksheet('Datos').getCell('A1').value = 'otro'; }],
        ['recurso', book => { book.getWorksheet('Instrucciones').getCell('B2').value = 'wastes'; }],
        ['modo', book => { book.getWorksheet('Instrucciones').getCell('B3').value = 'update'; }],
        ['hoja extra', book => { book.addWorksheet('Oculta'); }],
        ['texto enriquecido', book => { book.getWorksheet('Datos').getCell('A2').value = { richText: [{ text: 'Material' }] }; }],
        ['fecha', book => { book.getWorksheet('Datos').getCell('A2').value = new Date('2026-01-01T00:00:00Z'); }],
        ['error de celda', book => { book.getWorksheet('Datos').getCell('A2').value = { error: '#DIV/0!' }; }],
    ])('rechaza %s sin interpretar su contenido', async (_name, alter) => {
        await expect(read(await inventoryWorkbook({ rows: [{ name: 'Material' }], alter })))
            .rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
    });
    it('rechaza un libro vacío, corrupto y mayor al límite', async () => {
        await expect(read(await inventoryWorkbook({ rows: [] }))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
        await expect(read(Buffer.from('esto no es XLSX'))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
        await expect(read(Buffer.alloc(2 * 1024 * 1024 + 1))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it.each([
        ['fila fuera del rango', book => { book.getWorksheet('Datos').getCell('A5002').value = 'Fuera'; }],
        ['columna adicional', book => { book.getWorksheet('Datos').getRow(2).getCell(config.columns.length + 1).value = 'Fuera'; }]
    ])('limita %s sin expandir coordenadas vacías', async (_name, alter) => {
        await expect(read(await inventoryWorkbook({ rows: [{ name: 'Material' }], alter })))
            .rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it.each(['materials', 'consumables', 'wastes'].flatMap(resource => ['create', 'update', 'adjust'].map(mode => ({ resource, mode }))))(
        'genera una plantilla $resource/$mode compatible con el lector anterior', async ({ resource, mode }) => {
            const { workbook } = await readExcelReport(Buffer.from(await processInventoryWorkbook({
                action: 'template', config: getImportConfig(resource, mode), catalogs: {
                    suppliers: [{ code: 'PRO-001', tradeName: 'Proveedor' }],
                    presentations: [{ name: 'Pieza' }, { name: 'Rollo' }], units: ['pza · Pieza'],
                    materials: ['11111111-1111-4111-8111-111111111111 | Material | 2 × 3 | Pieza'],
                    reasons: catalogs.reasons
                }
            })));
            expect(workbook.worksheets.map(sheet => sheet.name)).toEqual(['Datos', 'Instrucciones', 'Catalogos']);
            const data = workbook.getWorksheet('Datos');
            expect(data.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
            expect(data.getCell('A1').font).toMatchObject({ bold: true });
            expect(data.getCell('A1').fill.fgColor.argb).toBe('FF174A5B');
            expect(workbook.getWorksheet('Instrucciones').getCell('B2').value).toBe(resource);
            expect(workbook.getWorksheet('Instrucciones').getCell('B3').value).toBe(mode);
            const instructionRows = workbook.getWorksheet('Instrucciones').getRows(1, 30)
                .map(row => row.values.slice(1));
            const instruction = label => instructionRows.find(([key]) => key === label)?.[1];
            expect(instruction('Límites')).toContain('500 filas');
            expect(instruction('Columnas grises')).toContain('grises');
            const config = getImportConfig(resource, mode);
            const columns = config.columns;
            const catalogHeaders = workbook.getWorksheet('Catalogos').getRow(1).values.slice(1).filter(Boolean);
            expect(catalogHeaders).toEqual(mode === 'create'
                ? resource === 'wastes'
                    ? ['Proveedor (código | nombre)', 'Material de referencia']
                    : ['Proveedor (código | nombre)', 'Presentación', 'Unidad']
                : mode === 'adjust' ? ['Motivo'] : ['Sin catálogos aplicables']);
            if (mode === 'create') {
                expect(instruction('Qué hacer')).toContain('Alta crea registros nuevos');
                expect(instruction('Cantidad inicial')).toContain('cantidad por presentación');
                expect(instruction('Conteo físico')).toBeUndefined();
                expect(instruction('Catálogos')).toContain(catalogHeaders.join(', '));
                expect(instruction('Límites')).not.toContain('filtra por proveedor o nombre');
                expect(instruction('Columnas grises')).not.toContain('versiones');
                expect(instruction('Catálogos')).not.toContain('UUID | nombre');
                if (resource === 'wastes') expect(instruction('Catálogos')).toContain('Material de referencia');
            } else if (mode === 'update') {
                expect(instruction('Qué hacer')).toContain('No modifica las existencias');
                expect(instruction('Cantidad inicial')).toBeUndefined();
                expect(instruction('Conteo físico')).toBeUndefined();
                expect(instruction('Catálogos')).toBeUndefined();
                expect(instruction('Límites')).toContain('filtra por proveedor o nombre');
                expect(instruction('Columnas grises')).toContain('versiones');
            } else {
                expect(instruction('Qué hacer')).toContain('conteo físico final');
                expect(instruction('Cantidad inicial')).toBeUndefined();
                expect(instruction('Conteo físico')).toContain('cero es válido');
                expect(instruction('Catálogos')).toContain('Motivo');
                expect(instruction('Catálogos')).toContain('UUID | nombre');
            }
            const common = ['Proveedor', 'Material', 'Base', 'Altura', 'Stock actual', 'Stock mínimo', 'Presentación', 'Conversión', 'Unidad', 'Costo unitario']
                .filter(header => mode !== 'adjust' || header !== 'Costo unitario');
            expect(data.getRow(1).values.slice(1, common.length + 1)).toEqual(common);
            expect(columns.some(([, key]) => key === 'operation')).toBe(false);
            const active = columns.findIndex(([, key]) => key === 'isActive') + 1;
            if (mode !== 'adjust') {
                expect(data.getRow(2).getCell(active).dataValidation).toMatchObject({ type: 'list', formulae: ['"SI,NO"'] });
                expect(data.getRow(501).getCell(active).dataValidation).toMatchObject({ type: 'list', formulae: ['"SI,NO"'] });
            }
            config.columns.forEach(([, key], index) => {
                expect(data.getRow(2).getCell(index + 1).fill?.fgColor?.argb === 'FFE7EDF0')
                    .toBe(config.readonlyFields.includes(key));
            });
            if (mode !== 'create') {
                const id = columns.findIndex(([, key]) => key === 'id') + 1;
                expect(data.getRow(2).getCell(id).fill.fgColor.argb).toBe('FFE7EDF0');
                expect(data.getRow(501).getCell(id).fill.fgColor.argb).toBe('FFE7EDF0');
            }
            else {
                const supplier = columns.findIndex(([, key]) => key === 'supplierCode') + 1;
                expect(data.getRow(2).getCell(supplier).dataValidation.formulae).toEqual(["'Catalogos'!$A$2:$A$2"]);
                expect(workbook.getWorksheet('Catalogos').getCell('A2').value).toBe('PRO-001 | Proveedor');
                if (resource === 'wastes') {
                    const material = columns.findIndex(([, key]) => key === 'materialId') + 1;
                    expect(data.getRow(2).getCell(material).dataValidation.formulae).toEqual(["'Catalogos'!$B$2:$B$2"]);
                }
                if (resource !== 'wastes') {
                    const presentation = columns.findIndex(([, key]) => key === 'presentationName') + 1;
                    const unit = columns.findIndex(([, key]) => key === 'unitLabel') + 1;
                    expect(data.getRow(2).getCell(presentation).dataValidation.formulae).toEqual(["'Catalogos'!$B$2:$B$3"]);
                    expect(data.getRow(2).getCell(unit).dataValidation.formulae).toEqual(["'Catalogos'!$C$2:$C$2"]);
                }
            }
            if (mode === 'adjust') {
                const reason = columns.findIndex(([, key]) => key === 'reasonId') + 1;
                expect(data.getRow(2).getCell(reason).dataValidation.formulae).toEqual(["'Catalogos'!$A$2:$A$2"]);
                expect(workbook.getWorksheet('Catalogos').getCell('A2').value).toBe(catalogs.reasons[0]);
            }
            const name = columns.findIndex(([, key]) => key === 'name') + 1;
            data.getRow(2).getCell(name).value = 'Captura editada';
            const parsed = await processInventoryWorkbook({ action: 'read', config: getImportConfig(resource, mode),
                bytes: await writeInventoryWorkbook(workbook) });
            expect(parsed).toHaveLength(1);
            expect(parsed[0]).toMatchObject({ row: 2, values: { name: 'Captura editada' } });
        }
    );
    it('limita los bytes realmente descomprimidos aunque la cabecera ZIP declare menos', async () => {
        const name = Buffer.from('oversized.xml');
        const compressed = deflateRawSync(Buffer.alloc(16 * 1024 * 1024 + 1, 'x'));
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
        local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(1, 22); local.writeUInt16LE(name.length, 26);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10);
        central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(1, 24); central.writeUInt16LE(name.length, 28);
        const end = Buffer.alloc(22);
        end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
        end.writeUInt32LE(central.length + name.length, 12); end.writeUInt32LE(local.length + name.length + compressed.length, 16);
        const bytes = Buffer.concat([local, name, compressed, central, name, end]);
        await expect(read(bytes)).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it('libera la puerta tras un rechazo o aborto y no encola trabajos concurrentes', async () => {
        const current = processInventoryWorkbook({ action: 'template', config, catalogs });
        await expect(read(Buffer.from('rechazado'))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_BUSY' });
        const workbook = await current;
        expect(workbook.byteLength).toBeGreaterThan(100);
        const controller = new AbortController();
        const interrupted = processInventoryWorkbook({ action: 'template', config, catalogs }, controller.signal);
        controller.abort();
        await expect(interrupted).rejects.toBeDefined();
        await expect(read(Buffer.from('rechazado'))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
    });
});
